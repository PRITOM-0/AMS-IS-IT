import React, { useEffect, useState } from "react";
import { Search, PackagePlus, UserCheck } from "lucide-react";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empRes, assetRes] = await Promise.all([
          fetch("http://localhost:3000/employees"),
          fetch("http://localhost:3000/assets"),
        ]);

        const empData = await empRes.json();
        const assetData = await assetRes.json();

        setEmployees(empData || []);
        setAssets(assetData || []);
      } catch (err) {
        console.error("Error loading assign data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const search = employeeSearch.toLowerCase();
    return (
      !search ||
      emp.employeeid?.toLowerCase().includes(search) ||
      emp.name?.toLowerCase().includes(search)
    );
  });

  const unassignedAssets = assets.filter((asset) => {
    const search = assetSearch.toLowerCase();
    const isUnassigned = !asset.assignDetails?.assignedTo;
    const matchesSearch =
      !search ||
      asset.assetCode?.toLowerCase().includes(search) ||
      asset.name?.toLowerCase().includes(search);

    return isUnassigned && matchesSearch;
  });

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId);

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedAssetId) {
      setMessage("Please select an employee and an asset first.");
      return;
    }

    if (!selectedAsset) {
      setMessage("Selected asset was not found.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const updatedAsset = {
      ...selectedAsset,
      status: "Active",
      assignDetails: {
        ...selectedAsset.assignDetails,
        assignedTo: selectedEmployee.employeeid,
        assignedDate: today,
        notes: notes || selectedAsset.assignDetails?.notes || "",
      },
      updatedAt: today,
    };

    const existingAssetList = Array.isArray(selectedEmployee.assetlist)
      ? selectedEmployee.assetlist
      : [];

    const updatedEmployee = {
      ...selectedEmployee,
      assetlist: [...new Set([...existingAssetList, selectedAsset.id])],
    };

    delete updatedEmployee.assetslist;

    try {
      await Promise.all([
        fetch(`http://localhost:3000/assets/${selectedAsset.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAsset),
        }),
        fetch(`http://localhost:3000/employees/${selectedEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEmployee),
        }),
      ]);

      setMessage(
        `Assigned ${selectedAsset.assetCode} to ${selectedEmployee.employeeid}`,
      );
      setSelectedAssetId("");
      setNotes("");
      setEmployeeSearch("");
      setAssetSearch("");
      setSelectedEmployee(null);

      const [empRes, assetRes] = await Promise.all([
        fetch("http://localhost:3000/employees"),
        fetch("http://localhost:3000/assets"),
      ]);

      setEmployees(await empRes.json());
      setAssets(await assetRes.json());
    } catch (err) {
      console.error("Error assigning asset:", err);
      setMessage("Assignment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen  p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-400 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-xl shadow-blue-100 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Assign Asset
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Search employees by employee code or name and assign available
                assets.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-400 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-lg shadow-slate-100">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-2.5 text-blue-600">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Select Employee
              </h2>
            </div>

            <div className="border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 rounded-2xl border border-slate-400 bg-slate-50 p-3 shadow-inner">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search by EMP code or name
              </label>
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="EMP-101 or Alice Johnson"
                className="w-full rounded-xl border border-slate-400 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Reset employee
              </button>
            </div>

            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-sm text-gray-500">Loading employees...</p>
              ) : filteredEmployees.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No matching employee found.
                </p>
              ) : (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setSelectedEmployee(emp)}
                    className={`w-full rounded-2xl border border-slate-400  p-3.5 text-left transition ${
                      selectedEmployee?.id === emp.id
                        ? "border-blue-600 bg-blue-500 text-white shadow-md"
                        : "border-slate-200 border-amber-200 text-amber-700 bg-gradient-to-br from-amber-100 via-white to-orange-100 text-slate-700 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <p className="font-semibold">{emp.name}</p>
                    <p
                      className={`text-sm ${
                        selectedEmployee?.id === emp.id
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {emp.employeeid}
                    </p>
                    <p
                      className={`text-xs ${
                        selectedEmployee?.id === emp.id
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {emp.designation}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border border-slate-400 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-lg shadow-slate-100">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-600">
                <PackagePlus size={20} />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Assign Asset
              </h2>
            </div>

            <div className="border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 mb-4 rounded-2xl border border-slate-400 bg-slate-50 p-3 shadow-inner">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search Asset by Code or Name
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  placeholder="AS-001 or Dell"
                  className="w-full rounded-xl border border-slate-400 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAssetId("")}
                className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Reset asset
              </button>
            </div>

            <div className="mb-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {unassignedAssets.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No unassigned assets available.
                </p>
              ) : (
                unassignedAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`w-full rounded-2xl border border-slate-400 p-3.5 text-left transition ${
                      selectedAssetId === asset.id
                        ? "border-blue-600 bg-blue-500 text-white shadow-md"
                        : "border-slate-400 border-emerald-200 text-emerald-700 bg-gradient-to-br from-emerald-100 via-white to-teal-100 text-slate-700 hover:border-emerald-300 hover:shadow-sm"
                    }`}
                  >
                    <p className="font-semibold">{asset.name}</p>
                    <p
                      className={`text-sm ${
                        selectedAssetId === asset.id
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {asset.assetCode}
                    </p>
                    <p
                      className={`text-xs ${
                        selectedAssetId === asset.id
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {asset.category}
                    </p>
                  </button>
                ))
              )}
            </div>

            {selectedEmployee && selectedAssetId && (
              <div className="mb-4 rounded-3xl border border-blue-400 bg-gradient-to-r from-blue-50 via-indigo-50 to-white p-4 shadow-sm">
                <h3 className="mb-3 font-semibold text-blue-700">
                  Assignment Summary
                </h3>
                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/90 p-3 shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Employee
                    </p>
                    <hr />
                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedEmployee.name}
                    </p>
                    <p>{selectedEmployee.employeeid}</p>
                    <p className="text-slate-500">
                      {selectedEmployee.designation || "N/A"}
                    </p>
                    <p className="text-slate-500">
                      {selectedEmployee.location || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/90 p-3 shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Asset
                    </p>
                    <hr />
                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedAsset?.name || "N/A"}
                    </p>
                    <p>{selectedAsset?.assetCode || "N/A"}</p>
                    <p className="text-slate-500">
                      {selectedAsset?.category || "N/A"}
                    </p>
                    <p className="text-slate-500">
                      {selectedAsset?.brand || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 rounded-2xl border border-slate-400 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-3 shadow-inner">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Additional Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full rounded-xl border border-slate-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                placeholder="Add any remarks for this assignment"
              />
            </div>

            {selectedEmployee && selectedAssetId && (
              <button
                type="button"
                onClick={handleAssign}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
              >
                Assign Asset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetAssign;
