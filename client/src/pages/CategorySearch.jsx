import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HardDrive, MapPin, Building2, Search, X, Filter, RotateCcw } from "lucide-react";
import { API_BASE_URL } from "../env";
import AssetCard from "../components/AssetCard";

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
    brand: "",
    vendorName: "",
    surveyReport: "",
    ageYears: "",
  });

  // Unique dropdown options collected from DB
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    brands: [],
    vendors: [],
    surveyReports: [],
    ageYearsList: [],
  });

  // Helper function to calculate exact asset age in full completed years
  const getAssetAgeInYears = (purchaseDate) => {
    if (!purchaseDate) return null;
    const purchase = new Date(purchaseDate);
    if (isNaN(purchase.getTime())) return null;
    
    const today = new Date();
    let years = today.getFullYear() - purchase.getFullYear();
    const monthDiff = today.getMonth() - purchase.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < purchase.getDate())) {
      years--;
    }
    return years >= 0 ? years : 0;
  };

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

        // Extract unique ages present across all records
        const uniqueAges = Array.from(
          new Set(
            allAssets
              .map((asset) => getAssetAgeInYears(asset.purchaseDate))
              .filter((age) => age !== null)
          )
        ).sort((a, b) => a - b);

        setFilterOptions({
          statuses: getUniqueValues(allAssets, "status"),
          brands: getUniqueValues(allAssets, "brand"),
          vendors: getUniqueValues(allAssets, "vendorName"),
          surveyReports: getUniqueValues(allAssets, "surveyReport"),
          ageYearsList: uniqueAges,
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
      brand: "",
      vendorName: "",
      surveyReport: "",
      ageYears: "",
    });
    setSearchTerm("");
  };

  const hasActiveCustomFilters =
    Object.values(selectedFilters).some((val) => val !== "") || searchTerm !== "";

  // Multi-field dropdown filtering + client-side general text search
  const visibleAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Dropdown Filter Checks
      const matchStatus = selectedFilters.status
        ? String(asset.status || "").toLowerCase() === selectedFilters.status.toLowerCase()
        : true;
      const matchBrand = selectedFilters.brand
        ? String(asset.brand || "").toLowerCase() === selectedFilters.brand.toLowerCase()
        : true;
      const matchVendor = selectedFilters.vendorName
        ? String(asset.vendorName || "").toLowerCase() === selectedFilters.vendorName.toLowerCase()
        : true;
      const matchSurvey = selectedFilters.surveyReport
        ? String(asset.surveyReport || "").toLowerCase() === selectedFilters.surveyReport.toLowerCase()
        : true;

      // Single Year Exact Age Match
      let matchAge = true;
      if (selectedFilters.ageYears !== "") {
        const calculatedAge = getAssetAgeInYears(asset.purchaseDate);
        matchAge = calculatedAge !== null && calculatedAge === Number(selectedFilters.ageYears);
      }

      const passesDropdowns =
        matchStatus && matchBrand && matchVendor && matchSurvey && matchAge;

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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* DATALIST FOR SINGLE YEAR AGE SUGGESTIONS */}
      <datalist id="age-year-suggestions">
        {filterOptions.ageYearsList.map((years) => (
          <option key={years} value={years}>
            {years} {years === 1 ? "Year" : "Years"}
          </option>
        ))}
      </datalist>

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Active URL Badges */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
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
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={selectedFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Brand</label>
              <select
                value={selectedFilters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Vendor Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vendor</label>
              <select
                value={selectedFilters.vendorName}
                onChange={(e) => handleFilterChange("vendorName", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Vendors</option>
                {filterOptions.vendors.map((item, idx) => (
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">All Reports</option>
                {filterOptions.surveyReports.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Typeable Age Field with Single-Year Suggestions */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Age (Years)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  list="age-year-suggestions"
                  placeholder="e.g. 2"
                  value={selectedFilters.ageYears}
                  onChange={(e) => handleFilterChange("ageYears", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
                {selectedFilters.ageYears !== "" && (
                  <button
                    onClick={() => handleFilterChange("ageYears", "")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : visibleAssets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
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