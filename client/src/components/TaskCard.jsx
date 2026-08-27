import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  User,
  Cpu,
  Wrench,
  Building2,
  Calendar,
} from "lucide-react";

export default function TaskCard({ task }) {
  const navigate = useNavigate();

const getTimeElapsed = (dateString) => {
  if (!dateString) return "N/A";

  // Remove 'Z' to prevent the 6-hour UTC offset shift
  const start = new Date(String(dateString)).getTime();
  const diffMs = Math.max(0, Date.now() - start);

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};
  const timeSpent = getTimeElapsed(task.createdAt);

  const getProgressStyle = (progress) => {
    switch (progress) {
      case "Complete":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "On Process":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "Arrived":
      default:
        return "bg-amber-50 text-amber-700 border-amber-300";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-rose-50 text-rose-600 border-rose-300 font-bold";
      case "Medium":
        return "bg-orange-50 text-orange-600 border-orange-300";
      default:
        return "bg-slate-50 text-slate-600 border-slate-300";
    }
  };

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id || task.taskId}`)}
      className="group bg-white border border-indigo-300 hover:border-indigo-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
    >
      {/* Top Hover Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* 1. HEADER: TASK CODE, PRIORITY, & PROGRESS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center gap-2">
          {/* taskCode & Time Elapsed Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Task Code:
            </span>
            <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-md tracking-wider">
              #{task.taskCode || "TSK-000"}
            </span>
            
          </div>

          <div className="flex items-center gap-1.5">
            {/* priority */}
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                task.priority,
              )}`}
            >
              {task.priority || "Medium"}
            </span>
            {/* progress */}
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${getProgressStyle(
                task.progress,
              )}`}
            >
              {task.progress || "Arrived"}
            </span>
          </div>
        </div>

        {/* taskName */}
        <div>
          <div className="flex justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Task Title
            </label>
            
            {/* subCategory */}
            {task.subCategory && (
              <span className="bg-emerald-100/60 text-emerald-800 text-[10px] font-semibold my-2 px-2 py-0.5 rounded-md border border-emerald-200/50 shrink-0">
                {task.subCategory}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors leading-snug">
            <div className="flex justify-between">
            {task.taskName || "Untitled Task"}
            {/* NEW INSIGHT: Total Time Spent */}
            <span className="flex items-center gap-1 text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
              <Clock size={10} className="text-purple-500" />
              {timeSpent}
            </span>
            </div>
          </h3>
        </div>
      </div>

      {/* 2. ASSET & SUB-CATEGORY SECTION */}
      <div className="bg-slate-50/80 border border-indigo-100 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="p-1 bg-white border border-indigo-200 rounded-md text-indigo-600 shrink-0">
              <Cpu size={14} />
            </div>
            {/* assetCode, assetName, equipment */}
            <div className="truncate">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">
                Asset & Equipment
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {task.assetCode ? `[${task.assetCode}] ` : ""}
                {task.assetName || "Unspecified Asset"}
                {task.equipment ? ` — ${task.equipment}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* 3. USER, COMPANY & LOCATION GRID */}
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
          {/* username */}
          <div className="flex items-center gap-1.5 min-w-0">
            <User size={13} className="text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block leading-none">
                Requester
              </span>
              <span className="font-medium text-slate-700 truncate block">
                {task.username || "Unassigned"}
              </span>
            </div>
          </div>

          {/* company */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 size={13} className="text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block leading-none">
                Company
              </span>
              <span className="font-medium text-slate-700 truncate block">
                {task.company || "N/A"}
              </span>
            </div>
          </div>

          {/* location */}
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block leading-none">
                Location
              </span>
              <span className="font-medium text-slate-700 truncate block">
                {task.location || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER: COMPLAIN DATE & IT PERSON */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        {/* complainDate */}
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-slate-400" />
          <span>
            Created:{" "}
            <strong className="text-slate-700 font-semibold">
              {task.complainDate
                ? new Date(task.complainDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </strong>
          </span>
        </div>

        {/* itPersonName */}
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
          <Wrench size={12} className="text-indigo-600" />
          <span className="font-medium text-indigo-950">
            IT: {task.itPersonName || "Unassigned"}
          </span>
        </div>
      </div>
    </div>
  );
}