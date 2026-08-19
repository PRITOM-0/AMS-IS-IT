import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, FileSpreadsheet, ArrowLeft, Filter, AlertCircle } from "lucide-react";
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

// Helper to check if a purchaseDate string is a valid date
const isValidDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string" && typeof dateStr !== "number") return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

const ExportAssets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  
  // Updated filter state
  const [filters, setFilters] = useState({
    assetInfo: "",
    userInfo: "",
    minAgeYears: "",
    minAgeMonths: "",
    includeMissingDateInAge: false,
    purchaseDateFilter: "", // "", "valid", "missing_invalid"
    location: "",
    department: "",
    equipment: "",
    surveyReport: "",
    status: "",
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [availableExportFields, setAvailableExportFields] = useState(DEFAULT_EXPORT_FIELDS);
  const [selectedExportFields, setSelectedExportFields] = useState(DEFAULT_EXPORT_FIELDS);
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

  // Extract unique dropdown options from loaded assets
  const dropdownOptions = useMemo(() => {
    const locations = new Set();
    const departments = new Set();
    const equipments = new Set();
    const surveyReports = new Set();
    const statuses = new Set();

    assets.forEach((asset) => {
      if (asset.location) locations.add(asset.location);
      if (asset.department) departments.add(asset.department);
      if (asset.equipment) equipments.add(asset.equipment);
      if (asset.surveyReport) surveyReports.add(asset.surveyReport);
      if (asset.status) statuses.add(asset.status);
    });

    return {
      locations: Array.from(locations).sort(),
      departments: Array.from(departments).sort(),
      equipments: Array.from(equipments).sort(),
      surveyReports: Array.from(surveyReports).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [assets]);

  const sortedAssets = useMemo(() => {
    return [...assets].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return sortedAssets.filter((asset) => {
      // 1. Asset Info match
      const matchesAssetInfo =
        !filters.assetInfo ||
        `${asset.assetCode || ""}`.toLowerCase().includes(filters.assetInfo.toLowerCase()) ||
        `${asset.brand || ""}`.toLowerCase().includes(filters.assetInfo.toLowerCase()) ||
        `${asset.model || ""}`.toLowerCase().includes(filters.assetInfo.toLowerCase()) ||
        `${asset.serialNumber || ""}`.toLowerCase().includes(filters.assetInfo.toLowerCase()) ||
        `${asset.macAddress || ""}`.toLowerCase().includes(filters.assetInfo.toLowerCase());

      // 2. User Info match
      const matchesUserInfo =
        !filters.userInfo ||
        `${asset.userName || ""}`.toLowerCase().includes(filters.userInfo.toLowerCase()) ||
        `${asset.userCode || ""}`.toLowerCase().includes(filters.userInfo.toLowerCase()) ||
        `${asset.userId || ""}`.toLowerCase().includes(filters.userInfo.toLowerCase());

      // 3. Dropdown matches
      const matchesLocation = !filters.location || asset.location === filters.location;
      const matchesDepartment = !filters.department || asset.department === filters.department;
      const matchesEquipment = !filters.equipment || asset.equipment === filters.equipment;
      const matchesSurveyReport = !filters.surveyReport || asset.surveyReport === filters.surveyReport;
      const matchesStatus = !filters.status || asset.status === filters.status;

      // 4. Purchase Date Status Filter (Valid vs Missing/Invalid text)
      const hasValidDate = isValidDate(asset.purchaseDate);
      let matchesPurchaseDateFilter = true;
      if (filters.purchaseDateFilter === "valid") {
        matchesPurchaseDateFilter = hasValidDate;
      } else if (filters.purchaseDateFilter === "missing_invalid") {
        matchesPurchaseDateFilter = !hasValidDate;
      }

      // 5. Min Age Calculation from Purchase Date
      let matchesMinAge = true;
      if (filters.minAgeYears || filters.minAgeMonths) {
        if (!hasValidDate) {
          // If date is invalid or missing, decide based on user checkbox preference
          matchesMinAge = filters.includeMissingDateInAge;
        } else {
          const pDate = new Date(asset.purchaseDate);
          const now = new Date();
          const diffTime = Math.max(0, now - pDate);
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          const reqYears = parseFloat(filters.minAgeYears) || 0;
          const reqMonths = parseFloat(filters.minAgeMonths) || 0;
          const reqTotalDays = reqYears * 365.25 + reqMonths * 30.4375;

          matchesMinAge = diffDays >= reqTotalDays;
        }
      }

      return (
        matchesAssetInfo &&
        matchesUserInfo &&
        matchesLocation &&
        matchesDepartment &&
        matchesEquipment &&
        matchesSurveyReport &&
        matchesStatus &&
        matchesPurchaseDateFilter &&
        matchesMinAge
      );
    });
  }, [sortedAssets, filters]);

  // Sync export fields with loaded assets
  useEffect(() => {
    if (!filteredAssets.length) return;

    const keys = new Set();
    filteredAssets.forEach((asset) => {
      Object.keys(asset || {}).forEach((key) => keys.add(key));
    });

    const sortedKeys = [...keys].sort();

    setAvailableExportFields(
      sortedKeys.length ? sortedKeys : DEFAULT_EXPORT_FIELDS
    );

    setSelectedExportFields((prevSelected) => {
      if (!isInitialized) {
        setIsInitialized(true);
        const defaultSet = new Set(DEFAULT_EXPORT_FIELDS);
        return sortedKeys.filter((key) => defaultSet.has(key));
      }
      const prevSet = new Set(prevSelected);
      return sortedKeys.filter((key) => prevSet.has(key));
    });
  }, [filteredAssets]);

  const toggleExportField = (field) => {
    setSelectedExportFields((prev) =>
      prev.includes(field)
        ? prev.filter((item) => item !== field)
        : [...prev, field]
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

  const handleResetFilters = () => {
    setFilters({
      assetInfo: "",
      userInfo: "",
      minAgeYears: "",
      minAgeMonths: "",
      includeMissingDateInAge: false,
      purchaseDateFilter: "",
      location: "",
      department: "",
      equipment: "",
      surveyReport: "",
      status: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner & Filter Controls */}
        <div className="rounded-2xl border border-slate-300 bg-white p-5 sm:p-6 shadow-sm">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => {
                  navigate("/assets", { replace: true });
                  window.location.reload();
                }}
                className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-[0.98]"
              >
                <ArrowLeft size={15} className="text-indigo-600" /> Back to Assets
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Export Assets
                </h1>
                
                {/* FILTER ASSET COUNT BADGE */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm">
                  <Filter size={13} className="text-indigo-600" />
                  Showing {filteredAssets.length} of {assets.length} Assets
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Filter assets by specifications, location, purchase date, or age, then pick columns for Excel export.
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

          {/* Filter Grid with Darker Visible Input Borders */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-slate-200">
            
            {/* Asset Info */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Asset Info</label>
              <input
                type="text"
                value={filters.assetInfo}
                placeholder="Code, brand, model, serial..."
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                onChange={(e) => setFilters({ ...filters, assetInfo: e.target.value })}
              />
            </div>

            {/* User Info */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">User Info</label>
              <input
                type="text"
                value={filters.userInfo}
                placeholder="User name, code, ID..."
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                onChange={(e) => setFilters({ ...filters, userInfo: e.target.value })}
              />
            </div>

            {/* Equipment Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Equipment</label>
              <select
                value={filters.equipment}
                onChange={(e) => setFilters({ ...filters, equipment: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                <option value="">All Equipments</option>
                {dropdownOptions.equipments.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                <option value="">All Locations</option>
                {dropdownOptions.locations.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                <option value="">All Departments</option>
                {dropdownOptions.departments.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Survey Report Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Survey Report</label>
              <select
                value={filters.surveyReport}
                onChange={(e) => setFilters({ ...filters, surveyReport: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                <option value="">All Survey Reports</option>
                {dropdownOptions.surveyReports.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                <option value="">All Statuses</option>
                {dropdownOptions.statuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Purchase Date Field Condition Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Date Field</label>
              <select
                value={filters.purchaseDateFilter}
                onChange={(e) => setFilters({ ...filters, purchaseDateFilter: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                <option value="">All (Valid & Invalid)</option>
                <option value="valid">Valid Date Only</option>
                <option value="missing_invalid">Missing / Text / Invalid Date Only</option>
              </select>
            </div>

            {/* Min Age (Yrs / Mos) Filter */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Min Age from Purchase Date (Years & Months)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  <input
                    type="number"
                    min="0"
                    value={filters.minAgeYears}
                    placeholder="Yrs (e.g. 2)"
                    className="w-1/2 text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                    onChange={(e) => setFilters({ ...filters, minAgeYears: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={filters.minAgeMonths}
                    placeholder="Mos (e.g. 6)"
                    className="w-1/2 text-xs sm:text-sm bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                    onChange={(e) => setFilters({ ...filters, minAgeMonths: e.target.value })}
                  />
                </div>

                {(filters.minAgeYears || filters.minAgeMonths) && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold bg-slate-100 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.includeMissingDateInAge}
                      onChange={(e) =>
                        setFilters({ ...filters, includeMissingDateInAge: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include missing/text date assets</span>
                  </label>
                )}
              </div>
            </div>

            {/* Filter Action Bar (Reset + Live Count display) */}
            <div className="sm:col-span-2 lg:col-span-2 flex items-center justify-between gap-3 pt-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-300">
                Filtered: <strong className="text-indigo-600 font-extrabold">{filteredAssets.length}</strong> / {assets.length} items
              </span>

              <button
                onClick={handleResetFilters}
                className="text-xs sm:text-sm font-semibold rounded-xl px-5 py-2 border border-slate-400 bg-white text-slate-800 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-sm"
              >
                Reset All Filters
              </button>
            </div>

          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <FileSpreadsheet size={18} className="text-indigo-600" />
              <span>Filtered Assets Preview</span>
            </div>
            
            {/* Asset Count Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-300">
              {filteredAssets.length} Item(s) Match
            </span>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="px-4 py-3 border-r border-slate-200">Asset Code</th>
                  <th className="px-4 py-3 border-r border-slate-200">Equipment</th>
                  <th className="px-4 py-3 border-r border-slate-200">Brand</th>
                  <th className="px-4 py-3 border-r border-slate-200">Model</th>
                  <th className="px-4 py-3 border-r border-slate-200">Purchase Date</th>
                  <th className="px-4 py-3 border-r border-slate-200">Status</th>
                  <th className="px-4 py-3 border-r border-slate-200">Location</th>
                  <th className="px-4 py-3 border-r border-slate-200">Department</th>
                  <th className="px-4 py-3 border-r border-slate-200">Survey Report</th>
                  <th className="px-4 py-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset, index) => {
                    const hasDate = isValidDate(asset.purchaseDate);
                    return (
                      <tr key={asset.id || index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 border-r border-slate-100 font-mono text-indigo-600 font-bold">
                          {asset.assetCode || "-"}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100 font-semibold text-slate-900">
                          {asset.equipment || "-"}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.brand || "-"}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.model || "-"}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          {hasDate ? (
                            <span className="font-mono text-slate-800">
                              {new Date(asset.purchaseDate).toISOString().slice(0, 10)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">
                              <AlertCircle size={12} />
                              {asset.purchaseDate ? `${asset.purchaseDate}` : "No Date"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                            {asset.status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.location || "-"}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.department || "-"}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.surveyReport || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {asset.userName || asset.userCode || "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-12 text-center text-slate-500 font-semibold"
                    >
                      No assets match the current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-300 shadow-2xl p-6 relative overflow-hidden">
              
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Select Excel Columns
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Choose which fields should be included in your exported Excel file ({filteredAssets.length} rows).
                  </p>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-indigo-50 border border-indigo-200 p-3">
                <span className="text-xs font-bold text-indigo-900">
                  <strong className="text-indigo-600">{selectedExportFields.length}</strong> fields selected
                </span>
                <button
                  onClick={() => setSelectedExportFields(availableExportFields)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Select all
                </button>
              </div>

              <div className="grid max-h-[380px] grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto rounded-xl border border-slate-300 bg-slate-50/50 p-3">
                {availableExportFields.map((field) => {
                  const isSelected = selectedExportFields.includes(field);
                  return (
                    <label
                      key={field}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-indigo-300 bg-indigo-50 text-indigo-900 shadow-sm"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleExportField(field)}
                        className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate">{field}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all active:scale-[0.98]"
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