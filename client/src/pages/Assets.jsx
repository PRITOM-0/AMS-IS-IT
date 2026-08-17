import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import AssetCard from "../components/AssetCard";
import { API_BASE_URL } from "../env";

const ITEMS_PER_PAGE = 24;

const INITIAL_FILTERS = {
  assetInfo: "",
  locationInfo: "",
  userInfo: "",
  status: "",
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
    ].some((field) => field?.toLowerCase().includes(q));
  },

  matchesLocationInfo: (asset, query) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [asset.location, asset.department, asset.floor, asset.room].some(
      (field) => field?.toLowerCase().includes(q)
    );
  },

  matchesUserInfo: (asset, query) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [asset.userName, asset.userCode].some(
      (field) => field?.toLowerCase().includes(q)
    );
  },

  matchesStatus: (asset, status) => !status || asset.status === status,
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

  // Filter and Sort Pipeline
  const filteredAssets = useMemo(() => {
    return [...assets]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter(
        (asset) =>
          filterStrategies.matchesAssetInfo(asset, filters.assetInfo) &&
          filterStrategies.matchesLocationInfo(asset, filters.locationInfo) &&
          filterStrategies.matchesUserInfo(asset, filters.userInfo) &&
          filterStrategies.matchesStatus(asset, filters.status)
      );
  }, [assets, filters]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / ITEMS_PER_PAGE));
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
    totalPages,
    currentPage,
    setCurrentPage,
    filters,
    handleFilterChange,
    resetFilters,
    loading,
  };
};

// ==========================================
// 3. PRESENTATIONAL SUB-COMPONENTS
// ==========================================

const AssetFilterBar = ({ filters, onFilterChange, onReset }) => (
  <div className="grid md:grid-cols-5 gap-4 items-end mb-6">
    <div>
      <label className="text-xs text-gray-500">Asset Info</label>
      <input
        type="text"
        placeholder="Search by Code, Equipment, Brand, Serial..."
        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
        value={filters.assetInfo}
        onChange={(e) => onFilterChange("assetInfo", e.target.value)}
      />
    </div>

    <div>
      <label className="text-xs text-gray-500">Location Info</label>
      <input
        type="text"
        placeholder="Search by Location, Dept, Room..."
        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
        value={filters.locationInfo}
        onChange={(e) => onFilterChange("locationInfo", e.target.value)}
      />
    </div>

    <div>
      <label className="text-xs text-gray-500">User Info</label>
      <input
        type="text"
        placeholder="Search by User, Employee ID..."
        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
        value={filters.userInfo}
        onChange={(e) => onFilterChange("userInfo", e.target.value)}
      />
    </div>

    <div>
      <label className="text-xs text-gray-500">Status</label>
      <select
        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
      >
        <option value="">All Status</option>
        <option value="Instore">Instore</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Maintenance">Maintenance</option>
        <option value="Death">Death</option>
      </select>
    </div>

    <button
      onClick={onReset}
      className="h-[42px] text-black border border-gray-500 bg-gray-300 rounded px-4 hover:bg-gray-400 transition"
    >
      Reset
    </button>
  </div>
);

const AssetGrid = ({ assets, loading }) => {
  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading assets...</p>;
  }

  if (assets.length === 0) {
    return <p className="p-6 text-center text-gray-500">No assets found matching your criteria.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
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
    totalPages,
    currentPage,
    setCurrentPage,
    filters,
    handleFilterChange,
    resetFilters,
    loading,
  } = useAssets();

  return (
    <div className="p-6">
      <div className="border border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] backdrop-blur-sm rounded-xl mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Asset Management
            </h1>
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