import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { FaBox } from "react-icons/fa";
import AssetCard from "../components/AssetCard";

const ITEMS_PER_PAGE = 24;

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    assetCode: "AS-",
    employeeId: "EMP-",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const resAssets = await fetch("http://localhost:3000/assets");
      const resEmp = await fetch("http://localhost:3000/employees");

      const assetsData = await resAssets.json();
      const empData = await resEmp.json();

      setAssets(assetsData);
      setEmployees(empData);
    };

    fetchData();
  }, []);

  // 🔍 Filter
  const filteredAssets = assets.filter((asset) => {
    const matchesAssetCode =
      filters.assetCode == "AS-" ||
      asset.assetCode?.toLowerCase().includes(filters.assetCode.toLowerCase());

    const matchesEmployee =
      filters.employeeId == "EMP-" ||
      asset.assignDetails?.assignedTo
        ?.toLowerCase()
        .includes(filters.employeeId.toLowerCase());

    const matchesStatus = !filters.status || asset.status === filters.status;

    return matchesAssetCode && matchesEmployee && matchesStatus;
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
      <div className="rounded-[28px] border border-indigo-200 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] backdrop-blur-sm">
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
        <div className="grid md:grid-cols-4 gap-4 items-end">
          {/* Asset Code */}
          <div>
            <label className="text-xs text-gray-500">Asset Code</label>
            <input
              type="text"
              placeholder="AS-001"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
              value={filters.assetCode}
              onChange={(e) =>
                setFilters({ ...filters, assetCode: e.target.value })
              }
            />
          </div>

          {/* Employee ID */}
          <div>
            <label className="text-xs text-gray-500">Employee ID</label>
            <input
              type="text"
              placeholder="EMP-101"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.employeeId}
              onChange={(e) =>
                setFilters({ ...filters, employeeId: e.target.value })
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Instore">Instore</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() =>
              setFilters({ assetCode: "AS-", employeeId: "EMP-", status: "" })
            }
            className="h-[42px] border border-gray-300 bg-gray-200 rounded px-4 hover:bg-gray-300 transition"
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
