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
  MapPin,
  Building2,
} from "lucide-react";
import { API_BASE_URL } from "../env";
import { DashboardCategoryTree } from "../components/DashboardCategoryTree";

export default function Dashboard() {
  const [data, setData] = useState({
    assets: [],
    tasks: [],
    users: [],
    admins: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetsRes, tasksRes, usersRes, adminsRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/assets`),
            fetch(`${API_BASE_URL}/tasks`),
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/admins`),
          ]);

        if (
          !assetsRes.ok ||
          !tasksRes.ok ||
          !usersRes.ok ||
          !adminsRes.ok
        ) {
          throw new Error("Failed to fetch data from JSON Server");
        }

        const [assets, tasks, users, admins] = await Promise.all([
          assetsRes.json(),
          tasksRes.json(),
          usersRes.json(),
          adminsRes.json(),
        ]);

        // Sort assets by updatedAt in descending order
        assets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        users.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        admins.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setData({ assets, tasks, users, admins });
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
    (a) => a.status === "Instore" || a.status === "",
  ).length;
  const inactiveAssets = data.assets.filter(
    (a) => a.status === "Inactive",
  ).length;
  const maintenanceAssets = data.assets.filter(
    (a) => a.status === "Maintenance",
  ).length;
  const deathAssets = data.assets.filter((a) => a.status === "Death").length;

  const totaltasks = data.tasks.length;
  const totalUsers = data.users.length;
  const totalAdmins = data.admins.length;

  // Calculate Total Financial Value
  const totalValue = data.assets.reduce((sum, asset) => {
    if (!asset.purchasePrice) return sum;

    const cleanedString = String(asset.purchasePrice).replace(/[^0-9.-]+/g, "");
    const numericVal = Number(cleanedString);

    if (isNaN(numericVal) || numericVal > 100000000) {
      return sum;
    }

    return sum + numericVal;
  }, 0);

  // equipment Breakdown
  const equipmentCounts = data.assets.reduce((acc, asset) => {
    const cat = asset.equipment || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // treee

  const getEquipmentTree = () => {
    const tree = {};

    data.assets.forEach((asset) => {
      const location = asset.location || "Unknown";
      const department = asset.department || "Unknown";
      const equipment = asset.equipment || "Unknown";

      tree[location] ??= {};
      tree[location][department] ??= {};
      tree[location][department][equipment] =
        (tree[location][department][equipment] || 0) +
        Number(asset.quantity || 1);
    });

    return tree;
  };

  const equipmentTree = getEquipmentTree();

  const handleUp = () => setDrag(null);

  return (
    <div className="min-h-screen text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-indigo-200 bg-gradient-to-r from-white via-indigo-50/80 to-emerald-50/80 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
                Overview
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Asset Overview
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
            title="Active Assets"
            value={activeAssets}
            subtext={`${Math.round((activeAssets / (totalAssets || 1)) * 100)}% utilization rate`}
            icon={<Sparkles size={18} />}
            color="emerald"
          />
          <StatCard
            title="Total Asset Value"
            value={`${totalValue} TK`}
            subtext="Estimated capital hardware value"
            icon={<CircleDollarSign size={18} />}
            color="amber"
          />
          <StatCard
            title="Total Task"
            value={totaltasks}
            subtext={`${totalUsers} standard users / ${totalAdmins} admins`}
            icon={<Users size={18} />}
            color="sky"
          />
        </div>

        {/* Middle Section: Status & Categories */}
        <div className="">
          {/* Asset Status Overview */}
          <div className="my-5 rounded-3xl border rounded-xl shadow-sm p-4 hover:shadow-md transition duration-200 border-green-200 text-indigo-700 bg-gradient-to-br from-green-200 via-white to-violet-200 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.30)]">
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
                label="Instore / Warehouse"
                count={instoreAssets}
                total={totalAssets}
                color="bg-indigo-600"
              />
              <StatusProgressBar
                label="Active / Assigned"
                count={activeAssets}
                total={totalAssets}
                color="bg-emerald-500"
              />
              <StatusProgressBar
                label="Inactive / Retired"
                count={inactiveAssets}
                total={totalAssets}
                color="bg-rose-500"
              />
              {/* <StatusProgressBar
                label="Maintenance"
                count={maintenanceAssets}
                total={totalAssets}
                color="bg-indigo-600"
              />
              <StatusProgressBar
                label="Death"
                count={deathAssets}
                total={totalAssets}
                color="bg-indigo-600"
              /> */}
            </div>
          </div>
          {/* Place the tree component directly inside your layout */}
          <DashboardCategoryTree equipmentTree={equipmentTree} />
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
        <div className=" font-extrabold text-slate-900">{value}</div>
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
