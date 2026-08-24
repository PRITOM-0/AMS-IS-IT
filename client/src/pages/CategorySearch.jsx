import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HardDrive, MapPin, Building2, Search, X, Filter, RotateCcw } from "lucide-react";
import { API_BASE_URL } from "../env";
import AssetCard from "../components/AssetCard";

// Helper to check if a purchaseDate string is a valid date
const isValidDate = (dateStr) => {
  if (!dateStr || (typeof dateStr !== "string" && typeof dateStr !== "number")) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

// Age filter logic (checks if asset age in full years >= required years)
const matchesAge = (purchaseDate, reqYearsStr) => {
  if (reqYearsStr === "" || reqYearsStr === undefined || reqYearsStr === null) {
    return true;
  }

  const reqYears = parseFloat(reqYearsStr);
  if (isNaN(reqYears)) return true;

  if (!isValidDate(purchaseDate)) {
    return false;
  }

  const pDate = new Date(purchaseDate);
  const now = new Date();

  let diffYears = now.getFullYear() - pDate.getFullYear();
  const monthDiff = now.getMonth() - pDate.getMonth();
  const dayDiff = now.getDate() - pDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    diffYears--;
  }

  return diffYears >= reqYears;
};

export default function CategorySearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const locationFilter = searchParams.get("location");
  const departmentFilter = searchParams.get("department");
  const equipmentFilter = searchParams.get("equipment");

  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic filter state
  const [selectedFilters, setSelectedFilters] = useState({
    status: "",
    equipment: "",
    department: "",
    surveyReport: "",
    showInvalidDatesOnly: false, // Checkbox toggle
    ageYears: "",
  });

  // Unique dropdown options collected from DB
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    equipments: [],
    departments: [],
    surveyReports: [],
  });

  useEffect(() => {
    const fetchAndFilterAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/assets`);
        if (!res.ok) throw new Error("Failed to fetch assets");

        const data = await res.json();
        const allAssets = Array.isArray(data) ? data : [];

        // Extract unique database values for filter dropdowns
        const getUniqueValues = (arr, key) =>
          Array.from(
            new Set(
              arr
                .map((item) => (item[key] ? String(item[key]).trim() : ""))
                .filter((val) => val !== "")
            )
          ).sort();

        setFilterOptions({
          statuses: getUniqueValues(allAssets, "status"),
          equipments: getUniqueValues(allAssets, "equipment"),
          departments: getUniqueValues(allAssets, "department"),
          surveyReports: getUniqueValues(allAssets, "surveyReport"),
        });

        // Apply primary URL hierarchical filters
        const filtered = allAssets.filter((asset) => {
          const matchLocation = locationFilter
            ? asset.location === locationFilter
            : true;
          const matchDept = departmentFilter
            ? asset.department === departmentFilter
            : true;
          const matchEquipment = equipmentFilter
            ? asset.equipment === equipmentFilter
            : true;

          return matchLocation && matchDept && matchEquipment;
        });

        setAssets(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterAssets();
  }, [locationFilter, departmentFilter, equipmentFilter]);

  const handleFilterChange = (field, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      status: "",
      equipment: "",
      department: "",
      surveyReport: "",
      showInvalidDatesOnly: false,
      ageYears: "",
    });
    setSearchTerm("");
  };

  const hasActiveCustomFilters =
    selectedFilters.status !== "" ||
    selectedFilters.equipment !== "" ||
    selectedFilters.department !== "" ||
    selectedFilters.surveyReport !== "" ||
    selectedFilters.showInvalidDatesOnly ||
    selectedFilters.ageYears !== "" ||
    searchTerm !== "";

  // Multi-field dropdown filtering + client-side general text search
  const visibleAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Dropdown Filter Checks
      const matchStatus = selectedFilters.status
        ? String(asset.status || "").toLowerCase() === selectedFilters.status.toLowerCase()
        : true;
      const matchEquipment = selectedFilters.equipment
        ? String(asset.equipment || "").toLowerCase() === selectedFilters.equipment.toLowerCase()
        : true;
      const matchDepartment = selectedFilters.department
        ? String(asset.department || "").toLowerCase() === selectedFilters.department.toLowerCase()
        : true;
      const matchSurvey = selectedFilters.surveyReport
        ? String(asset.surveyReport || "").toLowerCase() === selectedFilters.surveyReport.toLowerCase()
        : true;

      // Date Status & Age Filter Checks
      const hasValidDate = isValidDate(asset.purchaseDate);
      let matchDateCondition = true;

      if (selectedFilters.showInvalidDatesOnly) {
        // Show ONLY assets with missing or invalid dates
        matchDateCondition = !hasValidDate;
      } else {
        // Regular mode: Check age filter if input provided
        if (selectedFilters.ageYears !== "") {
          matchDateCondition = hasValidDate && matchesAge(asset.purchaseDate, selectedFilters.ageYears);
        } else {
          matchDateCondition = true;
        }
      }

      const passesDropdowns =
        matchStatus &&
        matchEquipment &&
        matchDepartment &&
        matchSurvey &&
        matchDateCondition;

      if (!passesDropdowns) return false;

      // Global Text Search Check
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();

      return Object.values(asset).some((val) =>
        val !== null && val !== undefined
          ? String(val).toLowerCase().includes(query)
          : false
      );
    });
  }, [assets, selectedFilters, searchTerm]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Active URL Badges */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-500 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {locationFilter && (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <MapPin size={12} /> {locationFilter}
              </span>
            )}
            {departmentFilter && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Building2 size={12} /> {departmentFilter}
              </span>
            )}
            {equipmentFilter && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <HardDrive size={12} /> {equipmentFilter}
              </span>
            )}
          </div>
        </div>

        {/* Header Title & Text Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Filtered Assets ({visibleAssets.length})
            </h1>
            <p className="text-sm text-slate-500">
              Filter assets dynamically using custom fields and database records.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search across all fields..."
              className="w-full rounded-xl border border-slate-500 bg-white py-2 pl-9 pr-8 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Database Field Dropdown Filters Bar */}
        <div className="rounded-2xl border border-slate-500 bg-white p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Filter size={14} className="text-indigo-600" /> Additional Database Filters
            </span>
            {hasActiveCustomFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 transition"
              >
                <RotateCcw size={12} /> Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={selectedFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border border-slate-500 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Equipment Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Equipment</label>
              <select
                value={selectedFilters.equipment}
                onChange={(e) => handleFilterChange("equipment", e.target.value)}
                className="w-full rounded-lg border border-slate-500 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Equipments</option>
                {filterOptions.equipments.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
              <select
                value={selectedFilters.department}
                onChange={(e) => handleFilterChange("department", e.target.value)}
                className="w-full rounded-lg border border-slate-500 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Departments</option>
                {filterOptions.departments.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Survey Report Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Survey Report</label>
              <select
                value={selectedFilters.surveyReport}
                onChange={(e) => handleFilterChange("surveyReport", e.target.value)}
                className="w-full rounded-lg border border-slate-500 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Reports</option>
                {filterOptions.surveyReports.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Number Input Age Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Age (Years+)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  disabled={selectedFilters.showInvalidDatesOnly}
                  placeholder={
                    selectedFilters.showInvalidDatesOnly
                      ? "Disabled"
                      : "Min age (e.g. 1)"
                  }
                  value={selectedFilters.ageYears}
                  onChange={(e) => handleFilterChange("ageYears", e.target.value)}
                  className="w-full rounded-lg border border-slate-500 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
                 
              </div>
            </div>

            {/* Checkbox for Invalid Purchase Dates */}
            <div className="flex items-center h-[34px] px-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedFilters.showInvalidDatesOnly}
                  onChange={(e) => handleFilterChange("showInvalidDatesOnly", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Invalid Dates Only
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-500 bg-white">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : visibleAssets.length === 0 ? (
          <div className="rounded-2xl border border-slate-500 bg-white p-12 text-center text-slate-500">
            {hasActiveCustomFilters
              ? "No assets match your selected filter criteria."
              : "No assets found matching the specified location/department/equipment criteria."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}