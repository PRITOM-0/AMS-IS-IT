import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Building2,
  HardDrive,
  ArrowUpRight,
  Boxes,
  Layers,
} from "lucide-react";

export function DashboardCategoryTree({ equipmentTree }) {
  const navigate = useNavigate();
  const [expandedLocations, setExpandedLocations] = useState({});

  const toggleLocation = (location) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [location]: !prev[location],
    }));
  };

  const handleNavigate = (e, params) => {
    e.stopPropagation();
    const searchParams = new URLSearchParams(params).toString();
    navigate(`/category-search?${searchParams}`);
  };

  // Aggregate total counts across all locations and departments for each category/equipment type
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    Object.values(equipmentTree || {}).forEach((departments) => {
      Object.values(departments).forEach((equipmentObj) => {
        Object.entries(equipmentObj).forEach(([equipment, count]) => {
          counts[equipment] = (counts[equipment] || 0) + count;
        });
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [equipmentTree]);

  const totalGlobalAssets = useMemo(() => {
    return categoryBreakdown.reduce((acc, [_, count]) => acc + count, 0);
  }, [categoryBreakdown]);

  return (
    <div className="space-y-4">
      {/* Existing Hierarchy Container */}
      <div className="rounded-3xl border rounded-xl shadow-sm p-4 hover:shadow-md transition duration-200 border-green-200 text-indigo-700 bg-gradient-to-br from-green-200 via-white to-violet-200 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.30)]">
        {/* Top Header */}
        <div className="mb-3 border-b border-slate-800 pb-2.5">
          <h2 className="text-base font-bold text-slate-900">
            Equipment Hierarchy
          </h2>
          <p className="text-[11px] font-medium text-slate-500">
            Click any location, department, or equipment type to view filtered assets.
          </p>
        </div>

        <div className="space-y-2.5">
          {Object.entries(equipmentTree || {}).map(([location, departments]) => {
            const isExpanded = !!expandedLocations[location];
            const locationTotal = Object.values(departments).reduce(
              (acc, eqObj) =>
                acc + Object.values(eqObj).reduce((a, b) => a + b, 0),
              0
            );

            return (
              <div
                key={location}
                className="overflow-hidden rounded-xl border border-slate-700/80 bg-gradient-to-r from-slate-100 via-indigo-50/20 to-slate-100 shadow-2xs transition-all duration-200 hover:border-slate-900"
              >
                {/* Location Row (Accordion Header) */}
                <div
                  onClick={() => toggleLocation(location)}
                  className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-slate-100/90 via-slate-50 to-indigo-50/40 px-3 py-2.5 transition hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="text-slate-600 transition-colors">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>

                    {/* Location Icon Badge */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-gradient-to-br from-indigo-600 to-slate-800 text-white shadow-2xs">
                      <MapPin size={13} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {location}
                      </span>
                      <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-800 shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        {locationTotal} Assets
                      </span>
                    </div>
                  </div>

                  {/* View All Button */}
                  <button
                    onClick={(e) => handleNavigate(e, { location })}
                    className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-bold text-white shadow-2xs transition-all hover:border-indigo-600 hover:bg-indigo-600 active:scale-95"
                  >
                    View All <ArrowUpRight size={13} />
                  </button>
                </div>

                {/* Nested Department & Equipment Content */}
                {isExpanded && (
                  <div className="space-y-2 border-t border-slate-300/80 bg-slate-200/40 p-2.5">
                    {Object.entries(departments).map(
                      ([department, equipmentObj]) => {
                        const deptTotal = Object.values(equipmentObj).reduce(
                          (a, b) => a + b,
                          0
                        );

                        return (
                          <div
                            key={department}
                            className="group/card relative overflow-hidden rounded-xl border border-slate-300/80 bg-gradient-to-br from-slate-100 via-violet-50/40 to-indigo-50/50 p-2.5 shadow-2xs transition-all duration-200 hover:border-slate-900 hover:shadow-xs"
                          >
                            {/* Department Header */}
                            <div className="mb-2 flex items-center justify-between border-b border-slate-300/80 pb-1.5">
                              <button
                                onClick={(e) =>
                                  handleNavigate(e, { location, department })
                                }
                                className="group/btn flex items-center gap-2 text-left transition"
                              >
                                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-800 bg-gradient-to-br from-violet-600 via-indigo-600 to-slate-800 text-white shadow-2xs transition-transform group-hover/btn:scale-105">
                                  <Building2 size={12} />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 transition-colors group-hover/btn:text-indigo-600">
                                  {department}
                                </h3>
                              </button>

                              <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-gradient-to-r from-violet-100 via-indigo-100 to-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-800 shadow-2xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                {deptTotal} Units
                              </span>
                            </div>

                            {/* Equipment Grid */}
                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
                              {Object.entries(equipmentObj).map(
                                ([equipment, count]) => (
                                  <button
                                    key={equipment}
                                    onClick={(e) =>
                                      handleNavigate(e, {
                                        location,
                                        department,
                                        equipment,
                                      })
                                    }
                                    className="group/item flex items-center justify-between gap-1.5 rounded-lg border border-slate-600/80 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-100 px-2 py-1 text-[11px] text-slate-800 shadow-2xs transition-all duration-150 hover:border-slate-900 hover:from-emerald-100/70 hover:via-teal-50 hover:to-slate-100 hover:text-slate-950 active:scale-[0.98]"
                                  >
                                    <span className="flex truncate items-center gap-1 font-medium">
                                      <HardDrive
                                        size={12}
                                        className="shrink-0 text-slate-600 transition-colors group-hover/item:text-emerald-700"
                                      />
                                      <span className="truncate">
                                        {equipment}
                                      </span>
                                    </span>

                                    {/* Equipment Count Tag */}
                                    <span className="flex shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-1.5 py-0.2 font-mono text-[10px] font-bold text-white shadow-2xs transition-colors group-hover/item:border-emerald-800 group-hover/item:bg-emerald-700">
                                      {count}
                                    </span>
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SEPARATE DIV: Category Breakdown Section */}
      <div className="rounded-3xl border rounded-xl shadow-sm p-4 hover:shadow-md transition duration-200 border-green-200 text-indigo-700 bg-gradient-to-br from-green-200 via-white to-violet-200 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.30)]">
        <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">
              <Boxes size={15} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Category Breakdown
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Aggregated equipment counts across all locations and departments.
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-indigo-700 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            <Layers size={13} />
            {categoryBreakdown.length} Categories
          </span>
        </div>

        {/* Category List Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categoryBreakdown.map(([category, totalCount]) => {
            const percentage = totalGlobalAssets
              ? Math.round((totalCount / totalGlobalAssets) * 100)
              : 0;

            return (
              <button
                key={category}
                onClick={(e) => handleNavigate(e, { equipment: category })}
                className="group flex flex-col justify-between rounded-xl border border-slate-500 bg-slate-50/50 p-2.5 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50/30 hover:shadow-2xs active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                    {category}
                  </span>
                  <ArrowUpRight
                    size={13}
                    className="shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600"
                  />
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {totalCount}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {percentage}%
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}