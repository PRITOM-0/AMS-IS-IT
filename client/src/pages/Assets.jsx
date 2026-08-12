import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { FaBox } from "react-icons/fa";
import AssetCard from "../components/AssetCard";
import { API_BASE_URL } from "../env";

const ITEMS_PER_PAGE = 24;

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    assetInfo: "",
    locationInfo: "",
    userInfo: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const resAssets = await fetch(`${API_BASE_URL}/assets`);
      const resEmp = await fetch(`${API_BASE_URL}/employees`);

      const assetsData = await resAssets.json();
      const empData = await resEmp.json();

      setAssets(assetsData);
      setEmployees(empData);
    };

    fetchData();
  }, []);

  //sort by date added, newest first
  const sortedAssets = [...assets].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // 🔍 Filter
  const filteredAssets = sortedAssets.filter((asset) => {
    const matchesAssetInfo =
      filters.assetInfo == "" ||
      asset.assetCode
        ?.toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      asset.equipment
        ?.toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(filters.assetInfo.toLowerCase()) ||
      asset.model?.toLowerCase().includes(filters.assetInfo.toLowerCase()) ||
      asset.serialNumber
        ?.toLowerCase()
        .includes(filters.assetInfo.toLowerCase()) ||
      asset.macAddress?.toLowerCase().includes(filters.assetInfo.toLowerCase());

    const matchesLocationInfo =
      filters.locationInfo == "" ||
      asset.location
        ?.toLowerCase()
        .includes(filters.locationInfo.toLowerCase()) ||
      asset.department
        ?.toLowerCase()
        .includes(filters.locationInfo.toLowerCase()) ||
      asset.floor?.toLowerCase().includes(filters.locationInfo.toLowerCase()) ||
      asset.room?.toLowerCase().includes(filters.locationInfo.toLowerCase());
    const matchesUserInfo =
      filters.userInfo == "" ||
      asset.userDetails?.name
        ?.toLowerCase()
        .includes(filters.userInfo.toLowerCase()) ||
      asset.userDetails?.userCode
        ?.toLowerCase()
        .includes(filters.userInfo.toLowerCase());

    const matchesStatus = !filters.status || asset.status === filters.status;

    return (
      matchesAssetInfo &&
      matchesLocationInfo &&
      matchesStatus &&
      matchesUserInfo
    );
  });

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAssets = filteredAssets.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className=" border border-indigo-200 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between ">
          <div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Asset Management
            </h1>
            <p className="mt-2 mb-5 text-sm text-slate-500">
              Real-time status of company hardware, inventory, and staff access.
            </p>
          </div>

          <Link
            to="/assets/addAsset"
            className="flex items-center space-x-3 rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <Plus size={18} /> Add Asset
          </Link>
        </div>
        <div className="mb-6">
          <div className="grid md:grid-cols-5 gap-4 items-end">
            {/* Asset info */}
            <div>
              <label className="text-xs text-gray-500">Asset Info</label>
              <input
                type="text"
                placeholder="Search by Asset Code, Equipment, Brand, Model, Serial Number, MAC Address"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
                value={filters.assetInfo}
                onChange={(e) =>
                  setFilters({ ...filters, assetInfo: e.target.value })
                }
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs text-gray-500">Location Info</label>
              <input
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
                value={filters.locationInfo}
                placeholder="Search by Location, Department, Floor, Room"
                onChange={(e) =>
                  setFilters({ ...filters, locationInfo: e.target.value })
                }
              />
            </div>
            {/* User */}
            <div>
              <label className="text-xs text-gray-500">User Info</label>
              <input
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
                value={filters.userInfo}
                placeholder="Search by User, Employee ID, Department"
                onChange={(e) =>
                  setFilters({ ...filters, userInfo: e.target.value })
                }
              />
            </div>
            {/* Status */}
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="Instore">Instore</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Death">Death</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() =>
                setFilters({
                  assetInfo: "",
                  locationInfo: "",
                  userInfo: "",
                  status: "",
                })
              }
              className="h-[42px] text-black border border-gray-500 bg-gray-300 rounded px-4 hover:bg-gray-400 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6"></div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4">
        {currentAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Assets;
