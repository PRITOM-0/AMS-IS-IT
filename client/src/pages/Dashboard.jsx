import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:3000"; // Adjust port if needed

export default function Dashboard() {
  const [data, setData] = useState({
    assets: [],
    employees: [],
    users: [],
    admins: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetsRes, employeesRes, usersRes, adminsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assets`),
          fetch(`${API_BASE_URL}/employees`),
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/admins`),
        ]);

        if (!assetsRes.ok || !employeesRes.ok || !usersRes.ok || !adminsRes.ok) {
          throw new Error("Failed to fetch data from JSON Server");
        }

        const [assets, employees, users, admins] = await Promise.all([
          assetsRes.json(),
          employeesRes.json(),
          usersRes.json(),
          adminsRes.json(),
        ]);

        setData({ assets, employees, users, admins });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-700">Loading Dashboard Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl max-w-md w-full text-center shadow-sm">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-3">
            Make sure <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-red-700">json-server</code> is running at{" "}
            <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-red-700">{API_BASE_URL}</code>
          </p>
        </div>
      </div>
    );
  }

  // Summary Statistics
  const totalAssets = data.assets.length;
  const activeAssets = data.assets.filter((a) => a.status === "Active").length;
  const instoreAssets = data.assets.filter((a) => a.status === "Instore").length;
  const inactiveAssets = data.assets.filter((a) => a.status === "Inactive").length;

  const totalEmployees = data.employees.length;
  const totalUsers = data.users.length;
  const totalAdmins = data.admins.length;

  // Calculate Total Financial Value
  const totalValue = data.assets.reduce((sum, asset) => {
    if (!asset.value) return sum;
    const numericVal = parseFloat(String(asset.value).replace(/[^0-9.-]+/g, ""));
    return sum + (isNaN(numericVal) ? 0 : numericVal);
  }, 0);

  // Category Breakdown
  const categoryCounts = data.assets.reduce((acc, asset) => {
    const cat = asset.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Asset Management Overview</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time status of company hardware, inventory, and staff access.</p>
          </div>
          <div className="flex items-center space-x-3 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>JSON Server Connected</span>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Assets"
            value={totalAssets}
            subtext={`${instoreAssets} available in store`}
            icon="💻"
            color="indigo"
          />
          <StatCard
            title="Active Assignments"
            value={activeAssets}
            subtext={`${Math.round((activeAssets / (totalAssets || 1)) * 100)}% utilization rate`}
            icon="⚡"
            color="emerald"
          />
          <StatCard
            title="Total Asset Value"
            value={`$${totalValue.toLocaleString()}`}
            subtext="Estimated capital hardware value"
            icon="💰"
            color="amber"
          />
          <StatCard
            title="Total Workforce"
            value={totalEmployees}
            subtext={`${totalUsers} standard users / ${totalAdmins} admins`}
            icon="👥"
            color="sky"
          />
        </div>

        {/* Middle Section: Status & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Status Overview */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Status Overview</span>
              <span className="text-xs font-medium text-slate-400">Inventory Distribution</span>
            </h2>
            <div className="space-y-4">
              <StatusProgressBar label="Active / Assigned" count={activeAssets} total={totalAssets} color="bg-emerald-500" />
              <StatusProgressBar label="Instore / Warehouse" count={instoreAssets} total={totalAssets} color="bg-indigo-600" />
              <StatusProgressBar label="Inactive / Retired" count={inactiveAssets} total={totalAssets} color="bg-rose-500" />
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Assets by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs uppercase font-semibold tracking-wider text-slate-500">{category}</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-800">{count}</span>
                    <span className="text-xs text-slate-400 font-medium">{Math.round((count / totalAssets) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Assets Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Asset Inventory List</h2>
            <span className="text-xs text-slate-500">Showing {data.assets.length} total entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3">Asset Code</th>
                  <th className="pb-3 px-3">Name</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Assigned To</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.assets.map((asset) => {
                  const assignedEmployee = data.employees.find((e) => e.employeeid === asset.assignDetails?.assignedTo);
                  return (
                    <tr key={asset.id || asset.assetCode} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-xs text-indigo-600 font-bold">{asset.assetCode}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">{asset.name}</td>
                      <td className="py-3.5 px-3 text-slate-500">{asset.category || "N/A"}</td>
                      <td className="py-3.5 px-3 text-slate-500">{asset.location || "N/A"}</td>
                      <td className="py-3.5 px-3 text-slate-700">
                        {assignedEmployee ? (
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full flex items-center justify-center text-xs font-bold">
                              {assignedEmployee.name.charAt(0)}
                            </span>
                            <span>{assignedEmployee.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={asset.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper Component: Stat Card */
function StatCard({ title, value, subtext, icon, color }) {
  const colorMap = {
    indigo: "border-indigo-100 text-indigo-600 bg-indigo-50",
    emerald: "border-emerald-100 text-emerald-600 bg-emerald-50",
    amber: "border-amber-100 text-amber-600 bg-amber-50",
    sky: "border-sky-100 text-sky-600 bg-sky-50",
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <span className={`p-2.5 rounded-xl border text-xl ${colorMap[color]}`}>{icon}</span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

/* Helper Component: Progress Bar */
function StatusProgressBar({ label, count, total, color }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-400">{count} ({percentage}%)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

/* Helper Component: Status Badge */
function StatusBadge({ status }) {
  let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
  if (status === "Active") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Instore") badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (status === "Inactive") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      {status || "Unknown"}
    </span>
  );
}