import React, { useState, useEffect } from "react";
import {
  BriefcaseBusiness,
  HardDrive,
  CircleDollarSign,
  Users,
  Sparkles,
  MonitorSmartphone,
  Warehouse,
  CircleAlert,
  Boxes,
  Wrench,
} from "lucide-react";
import { API_BASE_URL } from "../env";

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
        const [assetsRes, employeesRes, usersRes, adminsRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/assets`),
            fetch(`${API_BASE_URL}/employees`),
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/admins`),
          ]);

        if (
          !assetsRes.ok ||
          !employeesRes.ok ||
          !usersRes.ok ||
          !adminsRes.ok
        ) {
          throw new Error("Failed to fetch data from JSON Server");
        }

        const [assets, employees, users, admins] = await Promise.all([
          assetsRes.json(),
          employeesRes.json(),
          usersRes.json(),
          adminsRes.json(),
        ]);

        // Sort assets by updatedAt in descending order
        assets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        employees.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        users.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        admins.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.12),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-700 flex items-center justify-center px-4">
        <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-slate-200">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-700">
            Loading dashboard data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.14),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#fef2f2_100%)] text-slate-700 flex items-center justify-center p-6">
        <div className="bg-white/90 border border-red-200 text-red-800 px-6 py-5 rounded-2xl max-w-md w-full text-center shadow-lg backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-2">Error loading data</h2>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-3">
            Make sure{" "}
            <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-red-700">
              json-server
            </code>{" "}
            is running at{" "}
            <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-red-700">
              {API_BASE_URL}
            </code>
          </p>
        </div>
      </div>
    );
  }

  // Summary Statistics
  const totalAssets = data.assets.length;
  const activeAssets = data.assets.filter((a) => a.status === "Active").length;
  const instoreAssets = data.assets.filter(
    (a) => a.status === "Instore",
  ).length;
  const inactiveAssets = data.assets.filter(
    (a) => a.status === "Inactive",
  ).length;

  const totalEmployees = data.employees.length;
  const totalUsers = data.users.length;
  const totalAdmins = data.admins.length;

  // Calculate Total Financial Value
  const totalValue = data.assets.reduce((sum, asset) => {
    if (!asset.value) return sum;
    const numericVal = parseFloat(
      String(asset.value).replace(/[^0-9.-]+/g, ""),
    );
    return sum + (isNaN(numericVal) ? 0 : numericVal);
  }, 0);

  // Category Breakdown
  const categoryCounts = data.assets.reduce((acc, asset) => {
    const cat = asset.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.28),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.20),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(244,114,182,0.16),_transparent_28%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_45%,_#fdf2f8_100%)] text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-indigo-200 bg-gradient-to-r from-white via-indigo-50/80 to-emerald-50/80 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
                Overview
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Asset Management Overview
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Real-time status of company hardware, inventory, and staff
                access.
              </p>
            </div>
            <div className="flex items-center space-x-3 rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white"></span>
              <span>JSON Server Connected</span>
            </div>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Assets"
            value={totalAssets}
            subtext={`${instoreAssets} available in store`}
            icon={<BriefcaseBusiness size={18} />}
            color="indigo"
          />
          <StatCard
            title="Active Assignments"
            value={activeAssets}
            subtext={`${Math.round((activeAssets / (totalAssets || 1)) * 100)}% utilization rate`}
            icon={<Sparkles size={18} />}
            color="emerald"
          />
          <StatCard
            title="Total Asset Value"
            value={`${totalValue.toLocaleString()} Tk`}
            subtext="Estimated capital hardware value"
            icon={<CircleDollarSign size={18} />}
            color="amber"
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            subtext={`${totalUsers} standard users / ${totalAdmins} admins`}
            icon={<Users size={18} />}
            color="sky"
          />
        </div>

        {/* Middle Section: Status & Categories */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Asset Status Overview */}
          <div className="rounded-3xl border rounded-xl shadow-sm p-4 hover:shadow-md transition duration-200 border-green-200 text-indigo-700 bg-gradient-to-br from-green-200 via-white to-violet-200 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.30)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Status Overview
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Inventory Distribution
              </span>
            </div>
            <div className="space-y-4">
              <StatusProgressBar
                label="Active / Assigned"
                count={activeAssets}
                total={totalAssets}
                color="bg-emerald-500"
              />
              <StatusProgressBar
                label="Instore / Warehouse"
                count={instoreAssets}
                total={totalAssets}
                color="bg-indigo-600"
              />
              <StatusProgressBar
                label="Inactive / Retired"
                count={inactiveAssets}
                total={totalAssets}
                color="bg-rose-500"
              />
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="rounded-[24px] border border-slate-300 bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.30)] lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Assets by Category
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Distribution
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 ">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div
                  key={category}
                  className="rounded-2xl border rounded-xl shadow-sm p-2 hover:shadow-md transition duration-200 border-indigo-400 text-indigo-700 bg-gradient-to-br from-indigo-200 via-white to-violet-200 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {category}
                  </span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-800">
                      {count}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {Math.round((count / totalAssets) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Assets Table */}
        <div className="overflow-hidden rounded-[24px] border border-slate-300 bg-gradient-to-br from-white via-slate-200 to-indigo-150/50 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.30)]">
          <div className="flex flex-col gap-3 border-b border-slate-200/80 px-6  py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Asset Inventory List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {data.assets.length} total entries
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Live inventory
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">
                    Asset Code
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">
                    Location
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.assets.map((asset) => {
                  const assignedEmployee = data.employees.find(
                    (e) => e.employeeid === asset.assignDetails?.employeeid,
                  );
                  return (
                    <tr
                      key={asset.id || asset.assetCode}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">
                        {asset.assetCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {asset.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {asset.category || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {asset.location || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {assignedEmployee ? (
                          <div className="flex items-center space-x-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-xs font-bold text-indigo-600">
                              {assignedEmployee.name.charAt(0)}
                            </span>
                            <span>{assignedEmployee.name}</span>
                          </div>
                        ) : (
                          <span className="italic text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
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
    indigo:
      "border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100",
    emerald:
      "border-emerald-200 text-emerald-700 bg-gradient-to-br from-emerald-100 via-white to-teal-100",
    amber:
      "border-amber-200 text-amber-700 bg-gradient-to-br from-amber-100 via-white to-orange-100",
    sky: "border-sky-200 text-sky-700 bg-gradient-to-br from-sky-100 via-white to-cyan-100",
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-[24px] border border-slate-300 p-5 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.30)] transition-transform duration-200 hover:-translate-y-1 ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
          {title}
        </span>
        <span className={`rounded-2xl border p-2.5 ${colorMap[color]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900">{value}</div>
        <p className="mt-1 text-xs text-slate-500">{subtext}</p>
      </div>
    </div>
  );
}

/* Helper Component: Progress Bar */
function StatusProgressBar({ label, count, total, color }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-400">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-200/60 bg-slate-100">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

/* Helper Component: Status Badge */
function StatusBadge({ status }) {
  let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
  if (status === "Active")
    badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm";
  if (status === "Instore")
    badgeStyle = "bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm";
  if (status === "Inactive")
    badgeStyle = "bg-rose-100 text-rose-800 border-rose-300 shadow-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}
    >
      {status || "Unknown"}
    </span>
  );
}
