import React, { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CircleDollarSign,
  Users,
  Wrench,
  CheckCircle2,
  Clock3,
  Warehouse,
  UserCheck,
  UserRound,
  Settings2,
  CircleAlert,
  ShieldCheck,
  Layers,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { API_BASE_URL } from "../env";
import { DashboardCategoryTree } from "../components/DashboardCategoryTree";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/assets`).then(r => r.json()),
      fetch(`${API_BASE_URL}/services`).then(r => r.json()),
      fetch(`${API_BASE_URL}/users`).then(r => r.json()),
    ])
      .then(([a, s, u]) => {
        setAssets(Array.isArray(a) ? a : []);
        setServices(Array.isArray(s) ? s : []);
        setUsers(Array.isArray(u) ? u : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl border border-slate-100">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="font-semibold text-slate-700">Loading dashboard...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="max-w-md rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <CircleAlert size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Error loading data</h3>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );

  // ---------------- ASSETS ----------------
  const assetStatus = status =>
    assets.filter(a => a.status?.toLowerCase() === status).length;

  const totalAssets = assets.length;
  const active = assetStatus("active");
  const instock = assetStatus("instock") + assetStatus("instore");
  const inactive = assetStatus("inactive");
  const removal = assetStatus("removal");

  const assigned = assets.filter(a => a.employeeId).length;
  const unassigned = totalAssets - assigned;

  const assetValue = assets.reduce((sum, a) => {
    const value = Number(
      String(a.purchasePrice || 0).replace(/[^0-9.-]/g, "")
    );
    return Number.isNaN(value) ? sum : sum + value;
  }, 0);

  // ---------------- EMPLOYEES ----------------
  const totalEmployees = users.length;
  const employeesWithAssets = users.filter(
    u => Array.isArray(u.assetlist) && u.assetlist.length
  ).length;
  const employeesWithoutAssets = totalEmployees - employeesWithAssets;

  // ---------------- SERVICES HELPERS ----------------
  const totalServices = services.length;

  // Helper to filter and calculate metrics by Type and optional Status
  const getServiceMetrics = (type, status = null) => {
    const filtered = services.filter(s => {
      const matchType = s.type?.toLowerCase() === type.toLowerCase();
      const matchStatus = status ? s.status?.toLowerCase() === status.toLowerCase() : true;
      return matchType && matchStatus;
    });

    const count = filtered.length;
    const cost = filtered.reduce((sum, s) => {
      const val = Number(String(s.serviceCost || 0).replace(/[^0-9.-]/g, ""));
      return Number.isNaN(val) ? sum : sum + val;
    }, 0);

    return { count, cost };
  };

  // General Status totals & costs
  const overallStatusMetrics = (status) => {
    const filtered = services.filter(s => s.status?.toLowerCase() === status.toLowerCase());
    const count = filtered.length;
    const cost = filtered.reduce((sum, s) => {
      const val = Number(String(s.serviceCost || 0).replace(/[^0-9.-]/g, ""));
      return Number.isNaN(val) ? sum : sum + val;
    }, 0);
    return { count, cost };
  };

  const completedStats = overallStatusMetrics("completed");
  const ongoingStats = overallStatusMetrics("on process").count > 0 ? overallStatusMetrics("on process") : overallStatusMetrics("ongoing");
  const pendingStats = overallStatusMetrics("pending");

  const repairCompleted = getServiceMetrics("repair", "completed");
  const repairOngoing = getServiceMetrics("repair", "ongoing");
  const repairTotal = getServiceMetrics("repair");

  const updateCompleted = getServiceMetrics("update", "completed");
  const updateOngoing = getServiceMetrics("update", "ongoing");
  const updateTotal = getServiceMetrics("update");

  const totalServiceCost = services.reduce((sum, s) => {
    const value = Number(String(s.serviceCost || 0).replace(/[^0-9.-]/g, ""));
    return Number.isNaN(value) ? sum : sum + value;
  }, 0);

  // ---------------- TREE ----------------
  const equipmentTree = {};
  assets.forEach(asset => {
    const company = asset.company || "Unknown";
    const location = asset.location || "Unknown";
    const department = asset.department || "Unknown";
    const equipment = asset.equipment || "Unknown";

    equipmentTree[company] ??= {};
    equipmentTree[company][location] ??= {};
    equipmentTree[company][location][department] ??= {};

    equipmentTree[company][location][department][equipment] =
      (equipmentTree[company][location][department][equipment] || 0) +
      Number(asset.quantity || 1);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-sky-50/40 p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  System Live & Connected
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Asset & Operations Command Center
              </h1>
              <p className="text-sm text-indigo-100 mt-1">
                Colorful structured overview of assets, personnel allocations, and categorized services.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 border border-white/20 text-white text-xs font-bold backdrop-blur-md shadow-sm">
                <ShieldCheck size={16} className="text-emerald-400" />
                API Connected
              </div>
            </div>
          </div>
        </header>

        {/* THREE MAIN CARDS (EACH CARD IN FULL ROW) */}
        <div className="space-y-6">

          {/* 1. ASSETS CARD */}
          <DashboardCard
            title="Assets Management"
            subtitle="Inventory health, assignment ratios, and valuation"
            icon={<BriefcaseBusiness size={22} />}
            headerBg="bg-indigo-500"
            badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
            totalLabel="Total Assets"
            totalValue={totalAssets}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <StructuredStat label="Active" status="Operational" count={active} cost="—" color="green" />
              <StructuredStat label="In Stock" status="Available" count={instock} cost="—" color="blue" />
              <StructuredStat label="Inactive" status="Offline" count={inactive} cost="—" color="amber" />
              <StructuredStat label="Removal" status="Disposed" count={removal} cost="—" color="red" />
              <StructuredStat label="Assigned" status="Allocated" count={assigned} cost="—" color="purple" />
              <StructuredStat label="Unassigned" status="Free" count={unassigned} cost="—" color="slate" />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-indigo-500 p-2.5 text-white shadow-sm">
                  <CircleDollarSign size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-indigo-900">Total Valuation</p>
                  <p className="text-xs text-indigo-700">Calculated across all registered equipment</p>
                </div>
              </div>
              <span className="text-lg font-black text-indigo-900">{assetValue.toLocaleString()} TK</span>
            </div>
          </DashboardCard>

          {/* 2. SERVICES CARD (Separated Type: Repair & Update with Status, Count, Cost) */}
          <DashboardCard
            title="Services & Maintenance Operations"
            subtitle="Breakdown by Repair and Update categories with status, count, and expenditure"
            icon={<Wrench size={22} />}
            headerBg="bg-emerald-600"
            badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            totalLabel="Total Service Tickets"
            totalValue={totalServices}
          >
            {/* General Status Overview Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <SummaryBadge label="Completed" count={completedStats.count} cost={`${completedStats.cost.toLocaleString()} TK`} color="green" icon={<CheckCircle2 size={16} />} />
              <SummaryBadge label="On Process / Ongoing" count={ongoingStats.count} cost={`${ongoingStats.cost.toLocaleString()} TK`} color="amber" icon={<Activity size={16} />} />
              <SummaryBadge label="Pending" count={pendingStats.count} cost={`${pendingStats.cost.toLocaleString()} TK`} color="rose" icon={<AlertTriangle size={16} />} />
            </div>

            {/* Structured Type Rows: Repair vs Update */}
            <div className="space-y-4">
              {/* REPAIR ROW */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-500 p-1.5 text-white">
                      <Wrench size={14} />
                    </span>
                    <h3 className="font-bold text-blue-900 uppercase text-xs tracking-wider">Type: Repair</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-blue-900">
                    <span>Total Count: {repairTotal.count}</span>
                    <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800">Cost: {repairTotal.cost.toLocaleString()} TK</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TypeSubStat label="Completed Repairs" count={repairCompleted.count} cost={`${repairCompleted.cost.toLocaleString()} TK`} color="blue" />
                  <TypeSubStat label="Active/Ongoing Repairs" count={repairOngoing.count} cost={`${repairOngoing.cost.toLocaleString()} TK`} color="indigo" />
                </div>
              </div>

              {/* UPDATE ROW */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-purple-100">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-purple-500 p-1.5 text-white">
                      <RefreshCw size={14} />
                    </span>
                    <h3 className="font-bold text-purple-900 uppercase text-xs tracking-wider">Type: Update</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-purple-900">
                    <span>Total Count: {updateTotal.count}</span>
                    <span className="bg-purple-100 px-3 py-1 rounded-full text-purple-800">Cost: {updateTotal.cost.toLocaleString()} TK</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TypeSubStat label="Completed Updates" count={updateCompleted.count} cost={`${updateCompleted.cost.toLocaleString()} TK`} color="purple" />
                  <TypeSubStat label="Active/Ongoing Updates" count={updateOngoing.count} cost={`${updateOngoing.cost.toLocaleString()} TK`} color="pink" />
                </div>
              </div>
            </div>

            {/* Footer Total Cost */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50/60 border border-emerald-100 p-4">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-sm">
                  <CircleDollarSign size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-900">Total Service Expenditure</p>
                  <p className="text-xs text-emerald-700">Combined cost for all repair and update jobs</p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-900">{totalServiceCost.toLocaleString()} TK</span>
            </div>
          </DashboardCard>

          {/* 3. EMPLOYEES CARD */}
          <DashboardCard
            title="Personnel & Allocations"
            subtitle="Staff database and asset assignment distribution"
            icon={<Users size={22} />}
            headerBg="bg-sky-500"
            badgeColor="bg-sky-50 text-sky-700 border-sky-200"
            totalLabel="Total Employees"
            totalValue={totalEmployees}
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
              <StructuredStat label="With Assets" status="Assigned" count={employeesWithAssets} cost="—" color="green" />
              <StructuredStat label="Without Assets" status="Unallocated" count={employeesWithoutAssets} cost="—" color="amber" />
              <StructuredStat label="Assigned Assets" status="Distributed" count={assigned} cost="—" color="indigo" />
              <StructuredStat label="Unassigned Assets" status="In Store" count={unassigned} cost="—" color="slate" />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-sky-50/60 border border-sky-100 p-4">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-sky-500 p-2.5 text-white shadow-sm">
                  <UserCheck size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-sky-900">Asset Holder Reach</p>
                  <p className="text-xs text-sky-700">Active employees holding company property</p>
                </div>
              </div>
              <span className="text-lg font-black text-sky-900">{employeesWithAssets} personnel</span>
            </div>
          </DashboardCard>

        </div>

        {/* EQUIPMENT TREE */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-slate-900 p-2 text-white shadow-md">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Equipment Architecture Tree</h2>
              <p className="text-xs text-slate-500">Hierarchical layout structured by company, location, and department</p>
            </div>
          </div>
          <DashboardCategoryTree equipmentTree={equipmentTree} />
        </div>

      </div>
    </div>
  );
}

// --------------------------------------------------
// REUSABLE COMPONENTS WITH COLORFUL & STRUCTURED UI
// --------------------------------------------------

function DashboardCard({ title, subtitle, icon, headerBg, badgeColor, totalLabel, totalValue, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Colorful Header Strip */}
      <div className={`px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur-md shadow-inner text-white">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">{title}</h2>
            <p className="text-xs text-white/80">{subtitle}</p>
          </div>
        </div>

        <div className={`rounded-2xl px-4 py-2 border backdrop-blur-md shadow-sm font-bold text-xs flex items-center gap-2 ${badgeColor}`}>
          <span>{totalLabel}:</span>
          <span className="text-sm font-black">{totalValue}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 bg-slate-50/50">
        {children}
      </div>
    </section>
  );
}

function StructuredStat({ label, status, count, cost, color = "slate" }) {
  const colors = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    red: "bg-rose-50 border-rose-200 text-rose-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900",
    slate: "bg-slate-100 border-slate-200 text-slate-900",
  };

  return (
    <div className={`rounded-2xl p-3.5 border shadow-sm transition-transform duration-200 hover:scale-[1.02] ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-70">{label}</span>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold shadow-2xs">{status}</span>
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <span className="text-xl font-black">{count}</span>
        <span className="text-[11px] font-semibold opacity-65">{cost}</span>
      </div>
    </div>
  );
}

function SummaryBadge({ label, count, cost, color, icon }) {
  const styles = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
  };

  return (
    <div className={`rounded-2xl p-3 border flex items-center justify-between shadow-xs ${styles[color]}`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-white shadow-xs">{icon}</div>
        <div>
          <p className="text-[10px] font-bold uppercase opacity-70">{label}</p>
          <p className="text-lg font-black">{count}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[10px] uppercase font-semibold opacity-60 block">Cost</span>
        <span className="text-xs font-black">{cost}</span>
      </div>
    </div>
  );
}

function TypeSubStat({ label, count, cost, color }) {
  const styles = {
    blue: "bg-white border-blue-100 text-blue-900",
    indigo: "bg-white border-indigo-100 text-indigo-900",
    purple: "bg-white border-purple-100 text-purple-900",
    pink: "bg-white border-pink-100 text-pink-900",
  };

  return (
    <div className={`rounded-xl p-3 border flex items-center justify-between shadow-2xs ${styles[color]}`}>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg">Count: {count}</span>
        <span className="text-xs font-black text-slate-900">{cost}</span>
      </div>
    </div>
  );
}