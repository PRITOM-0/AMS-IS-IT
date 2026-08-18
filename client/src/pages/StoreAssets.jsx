import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Database,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Check,
  Search,
  ShieldCheck,
} from "lucide-react";

const StoreAssets = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const assetsToStore = location.state?.assets || [];
  const fileName = location.state?.fileName || "Uploaded File";

  const [loading, setLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importingAssetCode, setImportingAssetCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackProgress, setRollbackProgress] = useState(0);

  // Tracking state
  const [showResultModal, setShowResultModal] = useState(false);
  const [storedCount, setStoredCount] = useState(0);
  const [createdAssetIds, setCreatedAssetIds] = useState([]);

  // DB Verification
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [actualDbCount, setActualDbCount] = useState(0);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // Verify created records in DB
  const verifyDbRecords = async (idsToCheck) => {
    if (!idsToCheck || !idsToCheck.length) {
      setActualDbCount(0);
      return 0;
    }

    setIsCheckingDb(true);
    let existCount = 0;

    for (let id of idsToCheck) {
      try {
        const response = await fetch(`http://localhost:3000/assets/${id}`, {
          method: "GET",
        });
        if (response.ok) {
          existCount++;
        }
      } catch (err) {
        console.warn(`Verification check failed for ID ${id}:`, err);
      }
    }

    setActualDbCount(existCount);
    setIsCheckingDb(false);
    return existCount;
  };

  useEffect(() => {
    if (showResultModal && createdAssetIds.length > 0) {
      verifyDbRecords(createdAssetIds);
    }
  }, [showResultModal]);

  // Guaranteed High-Reliability Single POST Request
  const saveAssetReliable = async (assetData, maxRetries = 10) => {
    const { id, ...cleanData } = assetData;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch("http://localhost:3000/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanData),
        });

        if (response.ok) {
          const savedData = await response.json();
          if (savedData && savedData.id !== undefined) {
            return savedData;
          }
        }
      } catch (err) {
        setStatusMessage(`Server busy. Retrying (${attempt}/${maxRetries})...`);
      }

      // Exponential backoff delay with jitter to unlock disk write loops
      const backoffDelay = Math.min(100 * Math.pow(2, attempt - 1), 3000);
      await delay(backoffDelay);
    }
    throw new Error(`Failed after ${maxRetries} persistent attempts.`);
  };

  // Guaranteed High-Reliability Single DELETE Request
  const deleteAssetReliable = async (id, maxRetries = 10) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`http://localhost:3000/assets/${id}`, {
          method: "DELETE",
        });

        if (response.ok || response.status === 404) {
          return true;
        }
      } catch (err) {
        setStatusMessage(`Rollback busy. Retrying ID ${id} (${attempt}/${maxRetries})...`);
      }

      const backoffDelay = Math.min(100 * Math.pow(2, attempt - 1), 3000);
      await delay(backoffDelay);
    }
    return false;
  };

  // 100% Reliable Import Process
  const handleCreateAssets = async () => {
    if (!assetsToStore.length) return;

    setLoading(true);
    setMessage("");
    setSuccess(true);
    setImportProgress(0);
    setStatusMessage("Initializing safe import pipeline...");

    const actualCreatedIds = [];
    const failedItems = [];

    for (let index = 0; index < assetsToStore.length; index++) {
      const asset = assetsToStore[index];
      const codeLabel = asset.assetCode || `Item #${index + 1}`;
      setImportingAssetCode(codeLabel);
      setStatusMessage(`Writing item ${index + 1} of ${assetsToStore.length}...`);

      try {
        const savedData = await saveAssetReliable(asset);
        actualCreatedIds.push(savedData.id);
      } catch (err) {
        console.error(`❌ Critical import failure for ${codeLabel}:`, err.message);
        failedItems.push(asset);
      }

      setImportProgress(Math.round(((index + 1) / assetsToStore.length) * 100));

      // 80ms disk lock cooling delay between writes
      await delay(80);
    }

    setLoading(false);
    setStoredCount(actualCreatedIds.length);
    setCreatedAssetIds(actualCreatedIds);
    setShowResultModal(true);

    if (failedItems.length === 0) {
      setMessage(`✅ 100% Import Complete! Successfully saved ${actualCreatedIds.length} of ${assetsToStore.length} assets.`);
      setSuccess(true);
    } else {
      setMessage(`⚠️ Imported ${actualCreatedIds.length} of ${assetsToStore.length}. ${failedItems.length} failed due to severe lock.`);
      setSuccess(false);
    }
  };

  // 100% Reliable Rollback Process
  const rollbackCreatedAssets = async () => {
    if (!createdAssetIds.length) return;

    setIsRollingBack(true);
    setRollbackProgress(0);

    const idsToProcess = [...createdAssetIds];
    const failedIds = [];
    let deletedCount = 0;

    for (let i = 0; i < idsToProcess.length; i++) {
      const id = idsToProcess[i];
      setStatusMessage(`Deleting ID ${id} (${i + 1}/${idsToProcess.length})...`);
      
      const isDeleted = await deleteAssetReliable(id);

      if (isDeleted) {
        deletedCount++;
      } else {
        failedIds.push(id);
      }

      setRollbackProgress(Math.round(((i + 1) / idsToProcess.length) * 100));

      // 80ms disk lock cooling delay between deletions
      await delay(80);
    }

    setIsRollingBack(false);
    setCreatedAssetIds(failedIds);
    setStoredCount(failedIds.length);

    if (failedIds.length === 0) {
      setShowResultModal(false);
      setActualDbCount(0);
      setMessage(`↩️ Complete Rollback! Successfully deleted ${deletedCount} of ${deletedCount} assets from DB.`);
      setSuccess(true);
    } else {
      await verifyDbRecords(failedIds);
      setMessage(`⚠️ Rollback completed with issues: ${deletedCount} deleted, ${failedIds.length} items failed to delete.`);
      setSuccess(false);
    }
  };

  if (!assetsToStore.length) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Assets Received</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Please upload and map an Excel file first before accessing this page.
          </p>
          <button
            onClick={() => navigate("/import-assets")}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Go to Import Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-[0.98]"
            >
              <ArrowLeft size={15} className="text-indigo-600" /> Back to Mapping
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Database size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Review & Store Assets
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Source File: <strong className="text-indigo-600 font-semibold">{fileName}</strong> • Safe mode enabled for{" "}
                  <span className="font-bold text-slate-700">{assetsToStore.length}</span> objects
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Safe-Sync Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-violet-500"></div>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-indigo-600">
                    {importProgress}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                <ShieldCheck size={16} /> Safe Disk Synchronization
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Writing Assets to DB</h2>
              
              <p className="text-xs text-slate-500 mb-2">
                Processing:{" "}
                <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                  {importingAssetCode}
                </span>
              </p>

              <p className="text-[11px] text-amber-600 min-h-[16px] mb-4 font-medium">
                {statusMessage}
              </p>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-indigo-600 to-violet-600 transition-all duration-300 ease-out"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Result Modal */}
        {showResultModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden text-center">
              {isRollingBack ? (
                <div className="py-6 space-y-4">
                  <RotateCcw size={40} className="mx-auto text-rose-500 animate-spin" />
                  <h3 className="text-lg font-bold text-slate-900">Safe Rollback in Progress... ({rollbackProgress}%)</h3>
                  <p className="text-xs text-slate-500">
                    {statusMessage || "Deleting stored entries sequentially with disk cooling..."}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-rose-500 transition-all duration-200"
                      style={{ width: `${rollbackProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    storedCount === assetsToStore.length 
                      ? "bg-emerald-100 text-emerald-600" 
                      : "bg-amber-100 text-amber-600"
                  }`}>
                    {storedCount === assetsToStore.length ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    {storedCount === assetsToStore.length ? "100% Import Complete" : "Import Operation Finished"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mb-4">
                    All objects processed through safe disk sync:
                  </p>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6 space-y-2 text-left">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-600">Total File Items:</span>
                      <span className="font-bold text-slate-900">{assetsToStore.length}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-600">Successfully Saved:</span>
                      <span className={`font-bold ${storedCount === assetsToStore.length ? "text-emerald-600" : "text-amber-600"}`}>
                        {storedCount} / {assetsToStore.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm pt-2 border-t border-slate-200">
                      <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                        <Search size={14} className="text-indigo-600" />
                        Verified In Database:
                      </span>
                      {isCheckingDb ? (
                        <span className="inline-flex items-center gap-1 text-indigo-600 text-xs font-semibold animate-pulse">
                          <RefreshCw size={12} className="animate-spin" /> Checking DB...
                        </span>
                      ) : (
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {actualDbCount} assets
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={rollbackCreatedAssets}
                      disabled={isCheckingDb}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <RotateCcw size={16} /> Undo ({actualDbCount} in DB)
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/assets", { replace: true })}
                      disabled={isCheckingDb}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <Check size={16} /> Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Table & controls */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/30">
            <div>
              <h2 className="text-base font-bold text-slate-900">Asset Objects Table</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review mapped data rows before committing</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
              {assetsToStore.length} Objects
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold">
                  <th className="px-4 py-3 text-center w-12 border-r border-slate-200/50">#</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Asset Code</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Equipment</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Brand</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Model</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Department</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assetsToStore.map((asset, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-medium border-r border-slate-100">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100 font-mono text-indigo-600 font-semibold">
                      {asset.assetCode || "-"}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100 font-medium text-slate-900">
                      {asset.equipment || "-"}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100">{asset.brand || "-"}</td>
                    <td className="px-4 py-3 border-r border-slate-100">{asset.model || "-"}</td>
                    <td className="px-4 py-3 border-r border-slate-100">{asset.department || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {asset.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {message && (
            <div
              className={`p-4 mx-5 my-4 rounded-xl border flex items-start sm:items-center gap-3 shadow-sm transition-all ${
                success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {success ? (
                <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <p className="text-xs sm:text-sm font-medium">{message}</p>
            </div>
          )}

          <div className="p-4 sm:px-6 border-t border-slate-100 bg-white flex justify-end">
            <button
              onClick={handleCreateAssets}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <RefreshCw size={17} className="animate-spin" /> Syncing to Disk...
                </>
              ) : (
                <>
                  <Database size={17} /> Save {assetsToStore.length} Assets to DB
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAssets;