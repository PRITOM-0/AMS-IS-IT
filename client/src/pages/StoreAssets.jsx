import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Database,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const StoreAssets = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const assetsToStore = location.state?.assets || [];
  const fileName = location.state?.fileName || "Uploaded File";

  const [loading, setLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importingAssetCode, setImportingAssetCode] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);

 const handleCreateAssets = async () => {
  if (!assetsToStore.length) return;

  setLoading(true);
  setMessage("Starting import...");
  setSuccess(true);
  setImportProgress(0);

  const successfulResults = [];
  const failedAssets = [];

  // Generate safe unique numeric ID compatible with all environments
  const generateUniqueId = (index) => {
    return Date.now() + index + Math.floor(Math.random() * 1000);
  };

  const saveAssetWithRetry = async (assetData, index, maxRetries = 3) => {
    // Strip existing ID and set a fresh, universally compatible ID
    const { id, ...cleanData } = assetData;
    const payload = {
      ...cleanData,
      id: generateUniqueId(index),
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch("http://localhost:3000/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return await response.json();
        }

        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      } catch (err) {
        if (attempt === maxRetries) throw err;
        await new Promise((res) => setTimeout(res, 200));
      }
    }
  };

  for (let index = 0; index < assetsToStore.length; index++) {
    const asset = assetsToStore[index];
    const codeLabel = asset.assetCode || `Item #${index + 1}`;
    setImportingAssetCode(codeLabel);

    try {
      const result = await saveAssetWithRetry(asset, index);
      successfulResults.push(result);
    } catch (err) {
      console.error(`❌ Detailed Error on ${codeLabel}:`, err.message);
      failedAssets.push({ item: asset, error: err.message });
    }

    setImportProgress(Math.round(((index + 1) / assetsToStore.length) * 100));
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  setLoading(false);

  if (failedAssets.length === 0) {
    setSuccess(true);
    setMessage(`✓ All ${successfulResults.length} assets successfully saved!`);
    setTimeout(() => navigate("/assets", { replace: true }), 1500);
  } else {
    setSuccess(false);
    setMessage(
      `Saved ${successfulResults.length} of ${assetsToStore.length}. First error: ${failedAssets[0]?.error}`
    );
  }
};

  if (!assetsToStore.length) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No Assets Received
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Please upload and map an Excel file first before accessing this
            page.
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
              <ArrowLeft size={15} className="text-indigo-600" /> Back to
              Mapping
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
                  Source File:{" "}
                  <strong className="text-indigo-600 font-semibold">
                    {fileName}
                  </strong>{" "}
                  • Ready to commit{" "}
                  <span className="font-bold text-slate-700">
                    {assetsToStore.length}
                  </span>{" "}
                  objects to JSON server
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-start sm:items-center gap-3 shadow-sm transition-all ${
              success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {success ? (
              <CheckCircle
                size={18}
                className="text-emerald-600 shrink-0 mt-0.5 sm:mt-0"
              />
            ) : (
              <AlertCircle
                size={18}
                className="text-rose-600 shrink-0 mt-0.5 sm:mt-0"
              />
            )}
            <p className="text-xs sm:text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Modal Loader */}
        {loading && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"
                    style={{ animationDuration: "1s" }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-indigo-600">
                    {importProgress}%
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Posting Assets to Database
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Processing:{" "}
                <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                  {importingAssetCode}
                </span>
              </p>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Table Preview Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/30">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Asset Objects Table
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review mapped data rows before committing
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
              {assetsToStore.length} Objects
            </span>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold">
                  <th className="px-4 py-3 text-center w-12 border-r border-slate-200/50">
                    #
                  </th>
                  <th className="px-4 py-3 border-r border-slate-200/50">
                    Asset Code
                  </th>
                  <th className="px-4 py-3 border-r border-slate-200/50">
                    Equipment
                  </th>
                  <th className="px-4 py-3 border-r border-slate-200/50">
                    Brand
                  </th>
                  <th className="px-4 py-3 border-r border-slate-200/50">
                    Model
                  </th>
                  <th className="px-4 py-3 border-r border-slate-200/50">
                    Department
                  </th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assetsToStore.map((asset, index) => (
                  <tr
                    key={asset.id || index}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-slate-400 font-medium border-r border-slate-100">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100 font-mono text-indigo-600 font-semibold">
                      {asset.assetCode || "-"}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100 font-medium text-slate-900">
                      {asset.equipment || "-"}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100">
                      {asset.brand || "-"}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100">
                      {asset.model || "-"}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100">
                      {asset.department || "-"}
                    </td>
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

          {/* Payload Sample Block */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2.5">
              <Database size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Payload Sample (First 2 Records)
              </h3>
            </div>
            <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-auto max-h-[300px] shadow-inner border border-slate-800">
              {JSON.stringify(assetsToStore.slice(0, 2), null, 2)}
            </pre>
          </div>

          {/* Action Footer */}
          <div className="p-4 sm:px-6 border-t border-slate-100 bg-white flex justify-end">
            <button
              onClick={handleCreateAssets}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <RefreshCw size={17} className="animate-spin" /> Saving to
                  Server...
                </>
              ) : (
                <>
                  <Database size={17} /> Save {assetsToStore.length} Assets to
                  DB
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
