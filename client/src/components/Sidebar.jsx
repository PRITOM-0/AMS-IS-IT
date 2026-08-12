import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaClipboardList,
  FaCog,
  FaUserTie,
  FaShareSquare,
  FaExclamationCircle,
} from "react-icons/fa";
import { LuImport } from "react-icons/lu";

function Sidebar({ isOpen }) {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt size={18} />, path: "/" },
    {
      label: "Import Assets",
      icon: <LuImport size={18} />,
      path: "/importassets",
    },
    {
      label: "Export Assets",
      icon: <FaBoxOpen size={18} />,
      path: "/exportassets",
    },
    { label: "Assets", icon: <FaBoxOpen size={18} />, path: "/assets" },
    { label: "Employees", icon: <FaUserTie size={18} />, path: "/employees" },
    {
      label: "Assign Assets",
      icon: <FaShareSquare size={18} />,
      path: "/assign-assets",
    },
    {
      label: "Issues",
      icon: <FaExclamationCircle size={18} />,
      path: "/issues",
    },
    {
      label: "Requests",
      icon: <FaClipboardList size={18} />,
      path: "/requests",
    },

    //  { label: "Users", icon: <FaUsers size={18} />, path: "/users" },
    // { label: "Settings", icon: <FaCog size={18} />, path: "/settings" },//
  ];

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] 
      bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600
      text-white transition-all duration-300 z-40
      ${isOpen ? "w-56" : "w-16"} shadow-xl`}
    >
      <ul className="mt-4 space-y-2 px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li key={item.label} className="relative group">
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg
                transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-600 shadow-md"
                    : "hover:bg-gray-700 hover:scale-[1.02]"
                }`}
              >
                {/* Icon */}
                <span
                  className={`transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>

                {/* Label */}
                {isOpen && (
                  <span className="text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                )}
              </Link>

              {/* Tooltip when collapsed */}
              {!isOpen && (
                <span
                  className="absolute left-16 top-1/2 -translate-y-1/2
                  bg-black text-white text-xs px-2 py-1 rounded
                  opacity-0 group-hover:opacity-100
                  transition whitespace-nowrap"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Bottom Section */}
      <div className="absolute bottom-4 w-full px-2">
        <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400 text-center">
          {isOpen ? "Asset Manager v1.0" : "v1"}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
