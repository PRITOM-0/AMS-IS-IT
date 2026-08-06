import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../env";
import IssueCard from "../components/IssueCard";
import { Plus, Search } from "lucide-react";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const initialForm = {
    assetCode: "",
    reportedBy: "",
    assignedTo: "",
    status: "Open",
    priority: "Medium",
    description: "",
    createdAt: new Date().toISOString().split("T")[0],
  };

  const [form, setForm] = useState(initialForm);

  // 🔄 Fetch Issues
  const fetchIssues = async () => {
    const res = await fetch(`${API_BASE_URL}/issues`);
    const resAssets = await fetch(`${API_BASE_URL}/assets`);
    const resEmployees = await fetch(`${API_BASE_URL}/employees`);
    const assetsData = await resAssets.json();
    const employeesData = await resEmployees.json();
    setAssets(assetsData);
    setEmployees(employeesData);
    const data = await res.json();
    setIssues(data);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // ✍️ Handle Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Create Issue
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${API_BASE_URL}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        id: "ISS-" + Date.now(),
      }),
    });

    setForm(initialForm);
    setShowForm(false);
    fetchIssues();
  };

  // 🔍 Filter
  const filteredIssues = issues.filter((i) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      i.assetCode?.toLowerCase().includes(searchText) ||
      i.reportedBy?.toLowerCase().includes(searchText) ||
      i.id?.toLowerCase().includes(searchText);

    const matchFilter = filter === "All" || i.status === filter;

    return matchSearch && matchFilter;
  });

  // 📊 Tabs
  const tabs = ["All", "Open", "Solving", "Resolved", "Death"];

  const countByStatus = (status) =>
    issues.filter((i) => i.status === status).length;
 

  return (
    <div className="p-6 space-y-6">
      {/* 🔝 HEADER */}
      <div className="sticky top-0 bg-gray-50 z-10 pb-3 space-y-3">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-3">
          {/* Search */}
          <div className="flex items-center gap-2  border px-3 py-2 rounded-xl shadow-sm w-full md:w-96">
            <Search size={18} className="text-gray-400" />
            <input
              placeholder="Search by asset, ID, employee..."
              className="w-full outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow"
          >
            <Plus size={18} />
            Create Issue
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-full text-sm border transition
                ${
                  filter === t
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white hover:bg-gray-100"
                }`}
            >
              {t}
              {t !== "All" && (
                <span className="ml-1 text-xs opacity-70">
                  ({countByStatus(t)})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 📝 CREATE FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl shadow-lg border grid gap-4 md:grid-cols-2"
        >
          <input
            name="assetCode"
            placeholder="Asset Code"
            value={form.assetCode}
            onChange={handleChange}
            className="input"
          />

          <input
            name="reportedBy"
            placeholder="Reported By (EMP-XXX)"
            value={form.reportedBy}
            onChange={handleChange}
            className="input"
          />

          <input
            name="assignedTo"
            placeholder="Assign To (Employee ID)"
            value={form.assignedTo}
            onChange={handleChange}
            className="input"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option>Open</option>
            <option>Solving</option>
            <option>Resolved</option>
            <option>Death</option>
          </select>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="input"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <textarea
            name="description"
            placeholder="Issue description..."
            value={form.description}
            onChange={handleChange}
            className="input md:col-span-2"
          />

          <div className="flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button className="bg-green-600 text-white px-5 py-1.5 rounded-lg hover:bg-green-700">
              Save Issue
            </button>
          </div>
        </form>
      )}

      {/* 🎴 ISSUE GRID */}
      {filteredIssues.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIssues.map((issue) => {
            
            return (
              <IssueCard
                key={issue.id}
                issue={issue}
                asset={assets.find((a) => a.id === issue.assetId)}
                employee={employees.find((e) => e.id === issue.employeeId)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No issues found</p>
          <p className="text-sm">Try adjusting search or filters</p>
        </div>
      )}
    </div>
  );
}

export default Issues;
