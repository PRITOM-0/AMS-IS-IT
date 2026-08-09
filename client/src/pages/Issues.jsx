import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../env";
import IssueCard from "../components/IssueCard";
import { Plus, Search, User,X } from "lucide-react";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  // 🔍 Search states
  const [assetQuery, setAssetQuery] = useState("");
  const [employeeQuery, setEmployeeQuery] = useState("");

  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  const initialForm = {
    assetId: "",
    assetCode: "",
    employeeId: "",
    assignedTo: "",
    issueType: "Unknown",
    status: "Open",
    priority: "Medium",
    description: "",
    createdAt: "",
    resolvedAt: "",
  };

  const [form, setForm] = useState(initialForm);

  // 🔄 Fetch Data
  const fetchIssues = async () => {
    const res = await fetch(`${API_BASE_URL}/issues`);
    const resAssets = await fetch(`${API_BASE_URL}/assets`);
    const resEmployees = await fetch(`${API_BASE_URL}/employees`);

    const data = await res.json();
    const assetsData = await resAssets.json();
    const employeesData = await resEmployees.json();

    setIssues(data);
    setAssets(assetsData);
    setEmployees(employeesData);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // ✍️ Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔍 Filter Assets
  const filteredAssets = assets.filter((a) => {
    const q = assetQuery.toLowerCase();
    return (
      a.assetCode?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q)
    );
  });


  // ➕ Submit Issue
  const handleSubmit = async (e) => {
    e.preventDefault();
    form.employeeId=assetEmpId(form.assetCode);
    form.createdAt = new Date().toISOString();
    if (!form.assetId || !form.employeeId || !form.description) {
      alert("Please fill in all required fields.");
      return;
    }

    await fetch(`${API_BASE_URL}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        id: "" + Date.now(),
      }),
    });

    setForm(initialForm);
    setAssetQuery("");
    setEmployeeQuery("");
    setShowForm(false);
    fetchIssues();
  };

  // 🔍 Main Filter
  const filteredIssues = issues.filter((i) => {
    const q = search.toLowerCase();

    const matchSearch =
      i.assetCode?.toLowerCase().includes(q) ||
      i.id?.toLowerCase().includes(q);

    const matchFilter = filter === "All" || i.status === filter;

    return matchSearch && matchFilter;
  });

  const assetEmpName = (empCode) => {
    const employee = employees.find((e) => e.employeeCode === empCode);
    return employee ? employee.name : "Unassigned";
  };
    const assetEmpId = (assCode) => {
    const id = employees.find((e) => e.employeeCode === empCode);
    return employee ? employee.id : "";
  };

  const handleReset = () => {
    setForm(initialForm);
    setAssetQuery("");
    setEmployeeQuery("");
  }

  const tabs = ["All", "Open", "Solving", "Resolved", "Death"];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Issue Management</h1>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="flex items-center border px-3 py-2 rounded-xl w-full md:w-72">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              placeholder="Search issue..."
              className="w-full outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Button */}
          {showForm ? (
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl"
            >
              <X size={18} />
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              <Plus size={18} />
              Create
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              filter === t ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border-emerald-200 text-black bg-gradient-to-br from-emerald-100 via-white to-teal-100 p-6 rounded-xl shadow space-y-5 max-w-3xl mx-auto"
        >
          <h2 className="font-semibold text-lg">Create Issue</h2>

          {/* ASSET SELECT */}
          <div className="relative">
            <label className="text-sm">Asset</label>
            <input
              value={assetQuery}
              onChange={(e) => {
                setAssetQuery(e.target.value);
                setShowAssetDropdown(true);
              }}
              placeholder="Search asset..."
              className="w-full   border px-3 py-2 rounded"
            />

            {showAssetDropdown && assetQuery && (
              <div className="absolute bg-white z-10 border w-full rounded shadow max-h-40 overflow-y-auto">
                {filteredAssets.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setForm({
                        ...form,
                        assetId: a.id,
                        assetCode: a.assetCode,
                      });
                      setAssetQuery(`${a.assetCode} - ${a.name} - ${a.location} - ${assetEmpName(a.assignDetails?.assignedTo)}`);
                      setShowAssetDropdown(false);
                    }}
                    className="p-2  hover:bg-blue-100 cursor-pointer"
                  >
                    {a.assetCode} - {a.name} - {a.location} - {assetEmpName(a.assignDetails?.assignedTo)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STATUS + PRIORITY */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
            >
              <option>Open</option>
              <option>Solving</option>
              <option>Resolved</option>
              <option>Death</option>
            </select></div>

            <div className="flex flex-col">
              <label className="text-sm">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm">Issue Type</label>
              <select
                name="issueType"
                value={form.issueType}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
            >
               <option>Unknown</option>
              <option>Hardware</option>
              <option>Software</option>
              <option>Network</option>
            </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col">
            <label className="text-sm">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Issue description..."
            className="w-full border px-3 py-2 rounded"
          />
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Save Issue
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white ml-5 px-4 py-2 rounded"
          >
            Reset
          </button>
        </form>
      )}

      {/* ISSUE LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            asset={assets.find((a) => a.id === issue.assetId)}
            employee={employees.find((e) => e.id === issue.employeeId)}
          />
        ))}
      </div>
    </div>
  );
}

export default Issues;