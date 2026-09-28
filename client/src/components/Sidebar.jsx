 
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBoxOpen,
  FaPlusCircle,
  FaFileExport,
  FaCog,
  FaUserTie,
  FaShareSquare,
  FaUserCog,
  FaBuilding,
} from "react-icons/fa";
import { LuImport } from "react-icons/lu";
import { LayoutDashboard } from "lucide-react";

function Sidebar({ user }) {
  const location = useLocation();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const menuSections = [
    {
      title: "Main",
      items: [
        {
          label: "Dashboard",
          icon: <LayoutDashboard size={17} strokeWidth={3} />,
          path: "/",
        },
        {
          label: "Assets",
          icon: <FaBoxOpen size={17} />,
          path: "/assets",
        },
        {
          label: "Add Asset",
          icon: <FaPlusCircle size={17} />,
          path: "/assets/addAsset",
        },
        {
          label: "Assign Assets",
          icon: <FaShareSquare size={17} />,
          path: "/assign-assets",
        },
        {
          label: "Employees",
          icon: <FaUserTie size={17} />,
          path: "/employees",
        },
      ],
    },

    {
      title: "Management",
      items: [
        ...(isAdmin
          ? [
              {
                label: "Import Assets",
                icon: <LuImport size={17} />,
                path: "/importassets",
              },
            ]
          : []),

        {
          label: "Export Assets",
          icon: <FaFileExport size={17} />,
          path: "/exportassets",
        },
      ],
    },

    {
      title: "System",
      items: [
        // Admin only
        ...(isAdmin
          ? [
              {
                label: "User Settings",
                icon: <FaUserCog size={17} />,
                path: "/settings/users",
              },
            ]
          : []),

        // All users
        {
          label: "Vendor Settings",
          icon: <FaBuilding size={17} />,
          path: "/settings/vendors",
        },

        // All users
        {
          label: "Company Info",
          icon: <FaCog size={17} />,
          path: "/settings/company-info",
        },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-50 bg-white border-r border-gray-200 shadow-sm z-40 overflow-y-auto">
      <nav className="p-3">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-5">
            <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" &&
                    location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                    }`}
                  >
                    <span
                      className={
                        isActive ? "text-indigo-600" : "text-gray-500"
                      }
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
 