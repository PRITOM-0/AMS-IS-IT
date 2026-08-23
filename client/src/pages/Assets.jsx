import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, X } from "lucide-react";
import AssetCard from "../components/AssetCard";
import { API_BASE_URL } from "../env";

const ITEMS_PER_PAGE = 24;

const INITIAL_FILTERS = {
  assetInfo: "",
  location: "",
  department: "",
  equipment: "",
  surveyReport: "",
  status: "",
  ageYears: 0,
  invalidDateOnly: false,
};

// Helper function to calculate asset age in full years
const calculateAssetAgeInYears = (asset) => {
  const dateString =
    asset.purchaseDate || asset.acquisitionDate || asset.createdAt;
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    years -= 1;
  }

  return years;
};

// ==========================================
// 1. STRATEGY PATTERN: Isolated Filter Logic
// ==========================================
const filterStrategies = {
  matchesAssetInfo: (asset, query) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [
      asset.assetCode,
      asset.equipment,
      asset.brand,
      asset.model,
      asset.serialNumber,
      asset.macAddress,
      asset.userName,
      asset.userCode,
    ].some((field) => field?.toLowerCase().includes(q));
  },

  matchesLocation: (asset, location) =>
    !location || asset.location === location,

  matchesDepartment: (asset, department) =>
    !department || asset.department === department,

  matchesEquipment: (asset, equipment) =>
    !equipment || asset.equipment === equipment,

  matchesSurveyReport: (asset, surveyReport) =>
    !surveyReport || asset.surveyReport === surveyReport,

  matchesStatus: (asset, status) => !status || asset.status === status,

  matchesAge: (asset, ageYears, invalidDateOnly) => {
    const assetAge = calculateAssetAgeInYears(asset);

    // Filter exclusively for invalid/missing dates if toggled
    if (invalidDateOnly) {
      return assetAge === null;
    }

    if (!ageYears) return true;

    const targetYears = parseInt(ageYears, 10);
    if (isNaN(targetYears)) return true;

    if (assetAge === null) return false;

    // Returns assets that are at least as old as target years
    return assetAge >= targetYears;
  },
};

// ==========================================
// 2. CUSTOM HOOK (FACADE PATTERN)
// ==========================================
export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resAssets, resEmp] = await Promise.all([
          fetch(`${API_BASE_URL}/assets`),
          fetch(`${API_BASE_URL}/employees`),
        ]);

        const [assetsData, empData] = await Promise.all([
          resAssets.json(),
          resEmp.json(),
        ]);

        if (isMounted) {
          setAssets(assetsData);
          setEmployees(empData);
        }
      } catch (error) {
        console.error("Failed to fetch assets data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique dynamic options for select fields
  const filterOptions = useMemo(() => {
    const locations = Array.from(
      new Set(assets.map((a) => a.location).filter(Boolean)),
    );
    const departments = Array.from(
      new Set(assets.map((a) => a.department).filter(Boolean)),
    );
    const equipments = Array.from(
      new Set(assets.map((a) => a.equipment).filter(Boolean)),
    );
    const surveyReports = Array.from(
      new Set(assets.map((a) => a.surveyReport).filter(Boolean)),
    );
    const statuses = Array.from(
      new Set(assets.map((a) => a.status).filter(Boolean)),
    );

    return { locations, departments, equipments, surveyReports, statuses };
  }, [assets]);

  // Filter and Sort Pipeline
  const filteredAssets = useMemo(() => {
    return [...assets]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter(
        (asset) =>
          filterStrategies.matchesAssetInfo(asset, filters.assetInfo) &&
          filterStrategies.matchesLocation(asset, filters.location) &&
          filterStrategies.matchesDepartment(asset, filters.department) &&
          filterStrategies.matchesEquipment(asset, filters.equipment) &&
          filterStrategies.matchesSurveyReport(asset, filters.surveyReport) &&
          filterStrategies.matchesStatus(asset, filters.status) &&
          filterStrategies.matchesAge(
            asset,
            filters.ageYears,
            filters.invalidDateOnly,
          ),
      );
  }, [assets, filters]);

  // Pagination Calculations
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / ITEMS_PER_PAGE),
  );
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  }, []);

  return {
    assets: paginatedAssets,
    totalCount: assets.length,
    filteredCount: filteredAssets.length,
    totalPages,
    currentPage,
    setCurrentPage,
    filters,
    filterOptions,
    handleFilterChange,
    resetFilters,
    loading,
  };
};

// ==========================================
// 3. PRESENTATIONAL SUB-COMPONENTS
// ==========================================

const ActiveFilterBadges = ({ filters, onFilterChange }) => {
  const activeEntries = Object.entries(filters).filter(
    ([key, value]) =>
      Boolean(value) && key !== "ageYears" && key !== "invalidDateOnly",
  );

  const hasAgeFilter = Boolean(filters.ageYears);
  const hasInvalidDateFilter = Boolean(filters.invalidDateOnly);

  if (activeEntries.length === 0 && !hasAgeFilter && !hasInvalidDateFilter)
    return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-indigo-200/60">
      <span className="text-xs font-semibold text-slate-500">
        Active Filters:
      </span>

      {/* Age Filter Badge */}
      {hasAgeFilter && !hasInvalidDateFilter && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <strong>Min Age:</strong> {filters.ageYears}+ yrs
          <button
            onClick={() => onFilterChange("ageYears", "")}
            className="hover:text-indigo-900 transition-colors ml-1"
          >
            <X size={12} />
          </button>
        </span>
      )}

      {/* Invalid Date Badge */}
      {hasInvalidDateFilter && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <strong>Date Status:</strong> Invalid / Missing Date
          <button
            onClick={() => onFilterChange("invalidDateOnly", false)}
            className="hover:text-rose-900 transition-colors ml-1"
          >
            <X size={12} />
          </button>
        </span>
      )}

      {/* Standard Field Badges */}
      {activeEntries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
        >
          <strong className="capitalize">
            {key.replace(/([A-Z])/g, " $1")}:
          </strong>{" "}
          {value}
          <button
            onClick={() => onFilterChange(key, "")}
            className="hover:text-indigo-900 transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
};

const AssetFilterBar = ({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
}) => (
  <div className="mb-2">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 items-end">
      {/* Asset Info Input */}
      <div className="lg:col-span-2">
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Search Code, Name, User Code, Serial...
        </label>
        <input
          type="text"
          placeholder="Type here"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={filters.assetInfo}
          onChange={(e) => onFilterChange("assetInfo", e.target.value)}
        />
      </div>

      {/* Min Asset Age (Years) & Invalid Date Option */}
      <div>
  <label className="text-xs font-semibold text-gray-600 block mb-1">
    Min Age (Years)
  </label>
  <div className="relative flex items-center">
    <input
      type="number"
      min="0"
      placeholder="Years"
      disabled={filters.invalidDateOnly}
      className="w-full border border-gray-300 rounded-lg pl-3 pr-20 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white disabled:bg-gray-100 disabled:text-gray-400"
      value={filters.ageYears}
      onChange={(e) => onFilterChange("ageYears", e.target.value)}
    />
    <label
      className={`absolute right-1 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer select-none transition ${
        filters.invalidDateOnly
          ? "bg-rose-100 text-rose-700 border border-rose-300"
          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-300"
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={filters.invalidDateOnly}
        onChange={(e) =>
          onFilterChange("invalidDateOnly", e.target.checked)
        }
      />
      Invalid Date
    </label>
  </div>
</div>

      {/* Location Dropdown */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Location
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={filters.location}
          onChange={(e) => onFilterChange("location", e.target.value)}
        >
          <option value="">All Location</option>
          {filterOptions.locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Department Dropdown */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Department
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={filters.department}
          onChange={(e) => onFilterChange("department", e.target.value)}
        >
          <option value="">All Department</option>
          {filterOptions.departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Dropdown */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Equipment
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={filters.equipment}
          onChange={(e) => onFilterChange("equipment", e.target.value)}
        >
          <option value="">All Equipment</option>
          {filterOptions.equipments.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
      </div>

      {/* Survey Report Dropdown */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Survey Report
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={filters.surveyReport}
          onChange={(e) => onFilterChange("surveyReport", e.target.value)}
        >
          <option value="">All Surveys</option>
          {filterOptions.surveyReports.map((sr) => (
            <option key={sr} value={sr}>
              {sr}
            </option>
          ))}
        </select>
      </div>

      {/* Status Dropdown */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Status
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Instock">Instock</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Removal">Removal</option>
        </select>
      </div>

      {/* Reset Button */}
      <div>
        <button
          onClick={onReset}
          className="w-full h-[38px] text-xs font-bold text-red-700 border border-red-700   rounded-lg hover:bg-red-300 transition"
        >
          Reset
        </button>
      </div>
    </div>

    <ActiveFilterBadges filters={filters} onFilterChange={onFilterChange} />
  </div>
);

const AssetGrid = ({ assets, loading }) => {
  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading assets...</p>;
  }

  if (assets.length === 0) {
    return (
      <p className="p-6 text-center text-gray-500">
        No assets found matching your criteria.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id || asset._id} asset={asset} />
      ))}
    </div>
  );
};

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6 gap-2">
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNumber = i + 1;
        return (
          <button
            key={pageNumber}
            className={`px-3 py-1 border rounded transition ${
              currentPage === pageNumber
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// 4. MAIN CONTAINER COMPONENT
// ==========================================
const Assets = () => {
  const {
    assets,
    totalCount,
    filteredCount,
    totalPages,
    currentPage,
    setCurrentPage,
    filters,
    filterOptions,
    handleFilterChange,
    resetFilters,
    loading,
  } = useAssets();

  return (
    <div className="p-6">
      <div className="border border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] backdrop-blur-sm rounded-xl mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Asset Management
              </h1>
              {!loading && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {filteredCount} Shown
                  </span>
                  <span className="bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {totalCount} Total
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Real-time status of company hardware, inventory, and staff access.
            </p>
          </div>

          <Link
            to="/assets/addAsset"
            className="flex items-center space-x-3 rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
          >
            <Plus size={18} /> Add Asset
          </Link>
        </div>

        <AssetFilterBar
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      </div>

      <AssetGrid assets={assets} loading={loading} />

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Assets;