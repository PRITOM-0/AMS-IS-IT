import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaPlusCircle,
  FaFileExport,
  FaUsers,
  FaClipboardList,
  FaCog,
  FaUserTie,
  FaShareSquare,
  FaExclamationCircle,
} from "react-icons/fa";
import { LuImport } from "react-icons/lu";
import { LayoutDashboard } from 'lucide-react';

function Sidebar() {
  const location = useLocation();

  const menuSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard size={17} strokeWidth={3} />, path: "/" },
        { label: "Assets", icon: <FaBoxOpen size={17} />, path: "/assets" },
        { label: "Add Asset", icon: <FaPlusCircle size={17} />, path: "/assets/addAsset" },
      ],
    },
    {
      title: "Management",
      items: [
        {
          label: "Import Assets",
          icon: <LuImport size={17} />,
          path: "/importassets",
        },
        {
          label: "Export Assets",
          icon: <FaFileExport size={17} />,
          path: "/exportassets",
        },
        // { label: "Assign Assets", icon: <FaShareSquare size={17} />, path: "/assign-assets" },
        // { label: "Issues", icon: <FaExclamationCircle size={17} />, path: "/issues" },
        // { label: "Requests", icon: <FaClipboardList size={17} />, path: "/requests" },
      ],
    },
    // {
    //   title: "System",
    //   items: [
    //     { label: "Employees", icon: <FaUserTie size={17} />, path: "/employees" },
    //     { label: "Users", icon: <FaUsers size={17} />, path: "/users" },
    //     { label: "Settings", icon: <FaCog size={17} />, path: "/settings" },
    //   ],
    // },
  ];

  return (
    <aside
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-50
      bg-white/15 border-r border-indigo-500
      text-black z-40 flex flex-col justify-between select-none shadow-2xl"
    >
      {/* Navigation Links */}
      <div className="mt-5 px-3 space-y-6 overflow-y-auto scrollbar-none">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {section.title && (
              <h3 className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                {section.title}
              </h3>
            )}

            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                      text-sm font-medium transition-all duration-500 group
                      ${
                        isActive
                          ? "bg-indigo-600 text-white font-semibold scale-105"
                          : "text-black hover:bg-slate-900 hover:text-slate-200 hover:scale-105"
                      }`}
                    >
                      {/* Active Indicator Bar & Glow */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.7)]" />
                      )}

                      {/* Icon */}
                      <span
                        className={`transition-colors duration-900 ${
                          isActive
                            ? "text-white animate-[spin_0.5s_ease-in-out_1]"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        {item.icon}
                      </span>

                      {/* Label */}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Badge */}
      <div className="p-3 m-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Asset Manager</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;