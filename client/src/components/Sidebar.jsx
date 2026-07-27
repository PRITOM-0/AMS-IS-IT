import React from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaClipboardList,
  FaCog,
} from "react-icons/fa";

function Sidebar({ isOpen }) {
  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt size={20} />, path: "/" },
    { label: "Assets", icon: <FaBoxOpen size={20} />, path: "/assets" },
    { label: "Users", icon: <FaUsers size={20} />, path: "/users" },
    { label: "Requests", icon: <FaClipboardList size={20} />, path: "/requests" },
    { label: "Settings", icon: <FaCog size={20} />, path: "/settings" },
  ];

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-900 text-white transition-all duration-300 z-40 w-48`}
    >
      <ul className="mt-4 space-y-2">
        {menuItems.map((item) => (
          <li key={item.label}>
            <Link
              to={item.path}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-700"
            >
              {item.icon}
              {isOpen && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;