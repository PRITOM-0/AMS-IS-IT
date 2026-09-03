 
import React, { useEffect, useState } from "react";
import { Search, PackagePlus, UserCheck } from "lucide-react";
import { API_BASE_URL } from "../env";

function AssetAssign() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // --------------------------------------------------
  // Fetch employees and assets
  // --------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);

      const [empRes, assetRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/assets`),
      ]);

      if (!empRes.ok || !assetRes.ok) {
        throw new Error("Failed to load employees or assets.");
      }

      const empData = await empRes.json();
      const assetData = await assetRes.json();

      setEmployees(Array.isArray(empData) ? empData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
    } catch (error) {
      console.error("Error loading assign data:", error);
      setMessage("Failed to load employees or assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------------------------------
  // Employee search
  // --------------------------------------------------
  const filteredEmployees = employees.filter((emp) => {
    const search = employeeSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      String(emp.employeeId || "")
        .toLowerCase()
        .includes(search) ||
      String(emp.employeeName || "")
        .toLowerCase()
        .includes(search) ||
      String(emp.designation || "")
        .toLowerCase()
        .includes(search) ||
      String(emp.company || "")
        .toLowerCase()
        .includes(search) ||
      String(emp.location || "")
        .toLowerCase()
        .includes(search) ||
      String(emp.department || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // --------------------------------------------------
  // Only show assets that are not assigned
  // --------------------------------------------------
  const unassignedAssets = assets.filter((asset) => {
    const search = assetSearch.trim().toLowerCase();

    const isUnassigned =
      !asset.employeeId || String(asset.employeeId).trim() === "";

    const matchesSearch =
      !search ||
      String(asset.assetCode || "")
        .toLowerCase()
        .includes(search) ||
      String(asset.equipment || "")
        .toLowerCase()
        .includes(search) ||
      String(asset.brand || "")
        .toLowerCase()
        .includes(search) ||
      String(asset.model || "")
        .toLowerCase()
        .includes(search);

    return isUnassigned && matchesSearch;
  });

  const selectedAsset = assets.find(
    (asset) => asset.id === selectedAssetId,
  );

  // --------------------------------------------------
  // Assign employee to asset
  // --------------------------------------------------
  const handleAssign = async () => {
    if (!selectedEmployee || !selectedAssetId) {
      setMessage("Please select an employee and an asset first.");
      return;
    }

    if (!selectedAsset) {
      setMessage("Selected asset was not found.");
      return;
    }

    try {
      setAssigning(true);
      setMessage("");

      const now = new Date().toISOString();

      // ----------------------------------------------
      // Update asset
      // ----------------------------------------------
      const updatedAsset = {
        ...selectedAsset,

        // Current employee relationship
        employeeId: selectedEmployee.id,
        receivedDate: now,
        // Keep asset active when assigned
        status: "Active",

        updatedAt: now,
      };

      // ----------------------------------------------
      // Update employee assetlist
      // ----------------------------------------------
      const existingAssetList = Array.isArray(
        selectedEmployee.assetlist,
      )
        ? selectedEmployee.assetlist
        : [];

      const updatedEmployee = {
        ...selectedEmployee,

        assetlist: [
          ...new Set([
            ...existingAssetList,
            selectedAsset.id,
          ]),
        ],

        updatedAt: now,
      };

      // ----------------------------------------------
      // Save both endpoints
      // ----------------------------------------------
      const [assetResponse, employeeResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/assets/${selectedAsset.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedAsset),
            },
          ),

          fetch(
            `${API_BASE_URL}/employees/${selectedEmployee.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedEmployee),
            },
          ),
        ]);

      if (!assetResponse.ok) {
        throw new Error("Failed to update asset.");
      }

      if (!employeeResponse.ok) {
        throw new Error("Failed to update employee.");
      }

      setMessage(
        `Asset ${selectedAsset.assetCode} assigned to ${selectedEmployee.employeeName} (${selectedEmployee.employeeId}).`,
      );

      // Reset selections
      setSelectedAssetId("");
      setSelectedEmployee(null);
      setEmployeeSearch("");
      setAssetSearch("");
      setNotes("");

      // Reload latest data
      await fetchData();
    } catch (error) {
      console.error("Error assigning asset:", error);

      setMessage(
        error.message ||
          "Assignment failed. Please try again.",
      );
    } finally {
      setAssigning(false);
    }
  };

  // --------------------------------------------------
  // Reset employee selection
  // --------------------------------------------------
  const resetEmployee = () => {
    setSelectedEmployee(null);
    setEmployeeSearch("");
  };

  // --------------------------------------------------
  // Reset asset selection
  // --------------------------------------------------
  const resetAsset = () => {
    setSelectedAssetId("");
    setAssetSearch("");
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="rounded-3xl border border-slate-400 border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 text-indigo-700 shadow-xl shadow-blue-100 backdrop-blur">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Assign Asset
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Select an employee and assign an available asset.
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">

          {/* =====================================================
              EMPLOYEE SECTION
          ====================================================== */}
          <div className="rounded-3xl border border-slate-400 border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 text-indigo-700 shadow-lg shadow-slate-100">

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-2.5 text-blue-600">
                <UserCheck size={20} />
              </div>

              <h2 className="text-xl font-semibold text-slate-800">
                Select Employee
              </h2>
            </div>

            {/* Employee Search */}
            <div className="rounded-2xl border border-slate-400 border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-3 shadow-inner">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search Employee
              </label>

              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />

                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) =>
                    setEmployeeSearch(e.target.value)
                  }
                  placeholder="Employee ID or name"
                  className="w-full rounded-xl border border-slate-400 bg-white px-3 py-2.5 pl-9 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Reset */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetEmployee}
                className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Reset employee
              </button>
            </div>

            {/* Employee List */}
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">

              {loading ? (
                <p className="text-sm text-gray-500">
                  Loading employees...
                </p>
              ) : filteredEmployees.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No matching employee found.
                </p>
              ) : (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() =>
                      setSelectedEmployee(emp)
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedEmployee?.id === emp.id
                        ? "border-blue-600 bg-blue-500 text-white shadow-md"
                        : "border-slate-400 border-amber-200 bg-gradient-to-br from-amber-100 via-white to-orange-100 text-slate-700 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">

                      {/* Employee information */}
                      <div>
                        <h2 className="text-lg font-semibold">
                          {emp.employeeName || "N/A"}
                        </h2>

                        <p className="mt-1 text-sm">
                          Employee ID:{" "}
                          <strong>
                            {emp.employeeId || "N/A"}
                          </strong>
                        </p>

                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <strong>Designation:</strong>{" "}
                            {emp.designation || "N/A"}
                          </p>

                          <p>
                            <strong>Company:</strong>{" "}
                            {emp.company || "N/A"}
                          </p>

                          <p>
                            <strong>Location:</strong>{" "}
                            {emp.location || "N/A"}
                          </p>

                          <p>
                            <strong>Department:</strong>{" "}
                            {emp.department || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Asset count */}
                      <div className="shrink-0 text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            selectedEmployee?.id === emp.id
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {emp.assetlist?.length || 0} Assets
                        </span>
                      </div>

                    </div>
                  </button>
                ))
              )}

            </div>
          </div>

          {/* =====================================================
              ASSET SECTION
          ====================================================== */}
          <div className="rounded-3xl border border-slate-400 border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 text-indigo-700 shadow-lg shadow-slate-100">

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-600">
                <PackagePlus size={20} />
              </div>

              <h2 className="text-xl font-semibold text-slate-800">
                Select Asset
              </h2>
            </div>

            {/* Asset Search */}
            <div className="mb-4 rounded-2xl border border-slate-400 border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-3 shadow-inner">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search Asset
              </label>

              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />

                <input
                  type="text"
                  value={assetSearch}
                  onChange={(e) =>
                    setAssetSearch(e.target.value)
                  }
                  placeholder="Asset Code, Equipment, Brand or Model"
                  className="w-full rounded-xl border border-slate-400 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            {/* Reset */}
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={resetAsset}
                className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Reset asset
              </button>
            </div>

            {/* Asset List */}
            <div className="mb-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">

              {loading ? (
                <p className="text-sm text-gray-500">
                  Loading assets...
                </p>
              ) : unassignedAssets.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No unassigned assets available.
                </p>
              ) : (
                unassignedAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() =>
                      setSelectedAssetId(asset.id)
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedAssetId === asset.id
                        ? "border-blue-600 bg-blue-500 text-white shadow-md"
                        : "border-slate-400 border-emerald-200 bg-gradient-to-br from-emerald-100 via-white to-teal-100 text-slate-700 hover:border-emerald-300 hover:shadow-sm"
                    }`}
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="font-semibold">
                          {asset.equipment || "N/A"}
                        </p>

                        <p
                          className={`text-sm ${
                            selectedAssetId === asset.id
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {asset.assetCode || "N/A"}
                        </p>

                        <p
                          className={`text-xs ${
                            selectedAssetId === asset.id
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {asset.brand || "N/A"}
                          {" • "}
                          {asset.model || "N/A"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            selectedAssetId === asset.id
                              ? "bg-white/20 text-white"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {asset.status || "N/A"}
                        </span>
                      </div>

                    </div>

                  </button>
                ))
              )}

            </div>

            {/* =====================================================
                ASSIGNMENT SUMMARY
            ====================================================== */}
            {selectedEmployee && selectedAssetId && (
              <div className="mb-4 rounded-3xl border border-blue-400 bg-gradient-to-r from-blue-50 via-indigo-50 to-white p-4 shadow-sm">

                <h3 className="mb-3 font-semibold text-blue-700">
                  Assignment Summary
                </h3>

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">

                  {/* Employee */}
                  <div className="rounded-2xl bg-white/90 p-3 shadow-md">

                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Employee
                    </p>

                    <hr className="my-2" />

                    <p className="font-semibold text-slate-800">
                      {selectedEmployee.employeeName || "N/A"}
                    </p>

                    <p>
                      ID:{" "}
                      {selectedEmployee.employeeId || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedEmployee.designation || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedEmployee.company || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedEmployee.location || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedEmployee.department || "N/A"}
                    </p>
                  </div>

                  {/* Asset */}
                  <div className="rounded-2xl bg-white/90 p-3 shadow-md">

                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Asset
                    </p>

                    <hr className="my-2" />

                    <p className="font-semibold text-slate-800">
                      {selectedAsset?.equipment || "N/A"}
                    </p>

                    <p>
                      {selectedAsset?.assetCode || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedAsset?.brand || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedAsset?.model || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedAsset?.company || "N/A"}
                    </p>

                    <p className="text-slate-500">
                      {selectedAsset?.location || "N/A"}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-4 rounded-2xl border border-slate-400 border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-3 shadow-inner">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Additional Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows="3"
                className="w-full rounded-xl border border-slate-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                placeholder="Add any remarks for this assignment"
              />

            </div>

            {/* Assign Button */}
            {selectedEmployee && selectedAssetId && (
              <button
                type="button"
                onClick={handleAssign}
                disabled={assigning}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {assigning
                  ? "Assigning Asset..."
                  : "Assign Asset"}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetAssign;
 
