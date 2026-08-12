import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, FileSpreadsheet, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../env";

const DEFAULT_EXPORT_FIELDS = [
  "id",
  "assetCode",
  "equipment",
  "brand",
  "model",
  "serialNumber",
  "specifications",
  "macAddress",
  "department",
  "location",
  "floor",
  "room",
  "status",
  "userId",
  "userCode",
  "userName",
  "oldUsers",
  "receivedDate",
  "purchaseDate",
  "purchasePrice",
  "warrantyStart",
  "warrantyEnd",
  "vendorName",
  "remarks",
  "surveyReport",
  "createdAt",
  "updatedAt",
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
  const [selectedExportFields, setSelectedExportFields] = useState(
    DEFAULT_EXPORT_FIELDS,
  );

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

  useEffect(() => {
    const keys = new Set();

    filteredAssets.forEach((asset) => {
      Object.keys(asset || {}).forEach((key) => keys.add(key));
    });

    const sortedKeys = [...keys].sort();
    setAvailableExportFields(
      sortedKeys.length ? sortedKeys : DEFAULT_EXPORT_FIELDS,
    );

    setSelectedExportFields((prevSelected) => {
      const prevSet = new Set(prevSelected);
      const nextSelection = sortedKeys.filter((key) => prevSet.has(key));

      if (nextSelection.length) return nextSelection;
      return sortedKeys.length ? sortedKeys : DEFAULT_EXPORT_FIELDS;
    });
  }, [filteredAssets]);

  const toggleExportField = (field) => {
    setSelectedExportFields((prevSelected) => {
      if (prevSelected.includes(field)) {
        return prevSelected.filter((item) => item !== field);
      }
      return [...prevSelected, field];
    });
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
    <div className="p-6">
      <div className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigate("/assets", { replace: true });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft size={16} /> Back to Assets
              </button>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Export Assets
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Filter the asset list and choose the columns you want in the Excel
              file.
            </p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            disabled={!filteredAssets.length}
            className="flex items-center gap-2 rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5 justify-center">
          <div>
            <label className="text-xs text-gray-500">Asset Info</label>
            <input
              type="text"
              value={filters.assetInfo}
              placeholder="Code, equipment, brand, model"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) =>
                setFilters({ ...filters, assetInfo: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Location Info</label>
            <input
              type="text"
              value={filters.locationInfo}
              placeholder="Location, department, floor, room"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) =>
                setFilters({ ...filters, locationInfo: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">User Info</label>
            <input
              type="text"
              value={filters.userInfo}
              placeholder="User name, user code"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) =>
                setFilters({ ...filters, userInfo: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">All Status</option>
              <option value="Instore">Instore</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Death">Death</option>
            </select>
          </div>
          <div className="flex justify-end items-end"><button
            onClick={() =>
              setFilters({
                assetInfo: "",
                locationInfo: "",
                userInfo: "",
                status: "",
              })
            }
            className=" w-full h-[60%] rounded px-4 text-black border border-gray-500 bg-gray-300 hover:bg-gray-400 transition"
          >
            Reset
          </button></div>

          
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <FileSpreadsheet size={18} className="text-blue-600" />
            <span className="font-semibold">Filtered Assets</span>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {filteredAssets.length} item(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-200 px-3 py-2">
                  Asset Code
                </th>
                <th className="border border-slate-200 px-3 py-2">Equipment</th>
                <th className="border border-slate-200 px-3 py-2">Brand</th>
                <th className="border border-slate-200 px-3 py-2">Model</th>
                <th className="border border-slate-200 px-3 py-2">Status</th>
                <th className="border border-slate-200 px-3 py-2">Location</th>
                <th className="border border-slate-200 px-3 py-2">User</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border border-slate-200 px-3 py-2">
                      {asset.assetCode || "-"}
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      {asset.equipment || "-"}
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      {asset.brand || "-"}
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      {asset.model || "-"}
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      {asset.status || "-"}
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      {asset.location || "-"}
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      {asset.userName || asset.userCode || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    No assets match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Select Excel Fields
                </h2>
                <p className="text-sm text-slate-500">
                  Choose which asset properties should be included in the
                  exported file.
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
              <span className="text-sm font-medium text-slate-700">
                {selectedExportFields.length} fields selected
              </span>
              <button
                onClick={() => setSelectedExportFields(availableExportFields)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Select all
              </button>
            </div>

            <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
              {availableExportFields.map((field) => (
                <label
                  key={field}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedExportFields.includes(field)}
                    onChange={() => toggleExportField(field)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{field}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExportFilteredAssets()}
                disabled={!selectedExportFields.length}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportAssets;
