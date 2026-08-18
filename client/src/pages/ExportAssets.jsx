import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, FileSpreadsheet, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../env";

const DEFAULT_EXPORT_FIELDS = [
  "assetCode",
  "equipment",
  "brand",
  "model",
  "serialNumber",
  "macAddress",
  "department",
  "location",
  "floor",
  "status",
  "purchaseDate",
  "purchasePrice",
  "warrantyStart",
  "warrantyEnd",
  "vendorName",
  "remarks",
  "surveyReport",
];

const ExportAssets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState({
    assetInfo: "",
    locationInfo: "",
    userInfo: "",
    status: "",
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [availableExportFields, setAvailableExportFields] = useState(
    DEFAULT_EXPORT_FIELDS,
  );
  
  // FIX 1: Initialize selectedExportFields with DEFAULT_EXPORT_FIELDS
  const [selectedExportFields, setSelectedExportFields] = useState(
    DEFAULT_EXPORT_FIELDS,
  );
  
  // Track if fields have been initialized from API data once
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/assets`);
        const data = await res.json();
        setAssets(data || []);
      } catch (error) {
        console.error("Failed to load assets for export:", error);
        setAssets([]);
      }
    };

    fetchAssets();
  }, []);

  const sortedAssets = [...assets].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  const filteredAssets = sortedAssets.filter((asset) => {
    const matchesAssetInfo =
      filters.assetInfo === "" ||
      `${asset.assetCode || ""}`
        .toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      `${asset.equipment || ""}`
        .toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      `${asset.brand || ""}`
        .toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      `${asset.model || ""}`
        .toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      `${asset.serialNumber || ""}`
        .toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      `${asset.macAddress || ""}`
        .toLowerCase()
        .includes(filters.assetInfo.toLowerCase());

    const matchesLocationInfo =
      filters.locationInfo === "" ||
      `${asset.location || ""}`
        .toLowerCase()
        .includes(filters.locationInfo.toLowerCase()) ||
      `${asset.department || ""}`
        .toLowerCase()
        .includes(filters.locationInfo.toLowerCase()) ||
      `${asset.floor || ""}`
        .toLowerCase()
        .includes(filters.locationInfo.toLowerCase()) ||
      `${asset.room || ""}`
        .toLowerCase()
        .includes(filters.locationInfo.toLowerCase());

    const matchesUserInfo =
      filters.userInfo === "" ||
      `${asset.userName || ""}`
        .toLowerCase()
        .includes(filters.userInfo.toLowerCase()) ||
      `${asset.userCode || ""}`
        .toLowerCase()
        .includes(filters.userInfo.toLowerCase()) ||
      `${asset.userId || ""}`
        .toLowerCase()
        .includes(filters.userInfo.toLowerCase());

    const matchesStatus = !filters.status || asset.status === filters.status;

    return (
      matchesAssetInfo &&
      matchesLocationInfo &&
      matchesUserInfo &&
      matchesStatus
    );
  });

  // FIX 2: Correct field sync logic
  useEffect(() => {
    if (!filteredAssets.length) return;

    const keys = new Set();
    filteredAssets.forEach((asset) => {
      Object.keys(asset || {}).forEach((key) => keys.add(key));
    });

    const sortedKeys = [...keys].sort();

    setAvailableExportFields(
      sortedKeys.length ? sortedKeys : DEFAULT_EXPORT_FIELDS,
    );

    setSelectedExportFields((prevSelected) => {
      // On first load, select matching DEFAULT_EXPORT_FIELDS
      if (!isInitialized) {
        setIsInitialized(true);
        const defaultSet = new Set(DEFAULT_EXPORT_FIELDS);
        return sortedKeys.filter((key) => defaultSet.has(key));
      }
      
      // On subsequent filter changes, retain user selections that exist in sortedKeys
      const prevSet = new Set(prevSelected);
      return sortedKeys.filter((key) => prevSet.has(key));
    });
  }, [filteredAssets]);

  const toggleExportField = (field) => {
    setSelectedExportFields((prev) =>
      prev.includes(field)
        ? prev.filter((item) => item !== field)
        : [...prev, field],
    );
  };

  const handleExportFilteredAssets = (fields = selectedExportFields) => {
    if (!filteredAssets.length || !fields.length) return;

    const exportRows = filteredAssets.map((asset) => {
      const row = {};

      fields.forEach((field) => {
        const value = asset?.[field];
        row[field] =
          value === null || value === undefined
            ? ""
            : typeof value === "object"
              ? JSON.stringify(value)
              : value;
      });

      return row;
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Assets");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `filtered-assets-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Control Banner & Filters */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => {
                  navigate("/assets", { replace: true });
                  window.location.reload();
                }}
                className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-[0.98]"
              >
                <ArrowLeft size={15} className="text-indigo-600" /> Back to Assets
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Export Assets
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Filter the asset list and choose the columns you want in the Excel file.
              </p>
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              disabled={!filteredAssets.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none self-start md:self-auto"
            >
              <Download size={17} /> Export Excel
            </button>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-5 border-t border-indigo-100/60">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Info</label>
              <input
                type="text"
                value={filters.assetInfo}
                placeholder="Code, equipment, brand, model"
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                onChange={(e) =>
                  setFilters({ ...filters, assetInfo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location Info</label>
              <input
                type="text"
                value={filters.locationInfo}
                placeholder="Location, department, floor..."
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                onChange={(e) =>
                  setFilters({ ...filters, locationInfo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">User Info</label>
              <input
                type="text"
                value={filters.userInfo}
                placeholder="User name, user code"
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                onChange={(e) =>
                  setFilters({ ...filters, userInfo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">All Statuses</option>
                <option value="Instore">Instore</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Death">Death</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    assetInfo: "",
                    locationInfo: "",
                    userInfo: "",
                    status: "",
                  })
                }
                className="w-full text-xs sm:text-sm font-semibold rounded-xl px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Table Top Header */}
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/30">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base">
              <FileSpreadsheet size={18} className="text-indigo-600" />
              <span>Filtered Assets</span>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredAssets.length} Item(s)
            </span>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold">
                  <th className="px-4 py-3 border-r border-slate-200/50">Asset Code</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Equipment</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Brand</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Model</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Status</th>
                  <th className="px-4 py-3 border-r border-slate-200/50">Location</th>
                  <th className="px-4 py-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {asset.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        {asset.location || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {asset.userName || asset.userCode || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-slate-400 font-medium"
                    >
                      No assets match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Field Selection Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative overflow-hidden">
              
              {/* Modal Header */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Select Excel Fields
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Choose which asset properties should be included in your export.
                  </p>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  Close
                </button>
              </div>

              {/* Selection Counter & Quick Select */}
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-indigo-50/60 border border-indigo-100 p-3">
                <span className="text-xs font-semibold text-indigo-900">
                  <strong className="text-indigo-600 font-bold">{selectedExportFields.length}</strong> fields selected
                </span>
                <button
                  onClick={() => setSelectedExportFields(availableExportFields)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Select all
                </button>
              </div>

              {/* Field Checkbox Grid */}
              <div className="grid max-h-[380px] grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                {availableExportFields.map((field) => {
                  const isSelected = selectedExportFields.includes(field);
                  return (
                    <label
                      key={field}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-indigo-200 bg-indigo-50/40 text-indigo-900 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleExportField(field)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate">{field}</span>
                    </label>
                  );
                })}
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExportFilteredAssets()}
                  disabled={!selectedExportFields.length}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Download size={16} /> Download Excel
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExportAssets;