import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HardDrive, MapPin, Building2, Search, X } from "lucide-react";
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

  useEffect(() => {
    const fetchAndFilterAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/assets`);
        if (!res.ok) throw new Error("Failed to fetch assets");

        const data = await res.json();

        // Apply dynamic hierarchical URL filtering
        const filtered = data.filter((asset) => {
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

  // Client-side search across ALL object fields
  const visibleAssets = useMemo(() => {
    if (!searchTerm.trim()) return assets;
    const query = searchTerm.toLowerCase();

    return assets.filter((asset) =>
      Object.values(asset).some((val) =>
        val !== null && val !== undefined
          ? String(val).toLowerCase().includes(query)
          : false
      )
    );
  }, [assets, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Active Filter Badges */}
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

        {/* Header Title & Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Filtered Assets ({visibleAssets.length})
            </h1>
            <p className="text-sm text-slate-500">
              Showing results matched against your selected hierarchy and search terms.
            </p>
          </div>

          {/* Search Input Box */}
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

        {/* Content Area */}
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
            {searchTerm
              ? `No assets match your search for "${searchTerm}".`
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