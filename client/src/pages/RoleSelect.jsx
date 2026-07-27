import React from "react";
import RoleCard from "../components/RoleCard";
import { FaUserShield, FaUser } from "react-icons/fa";

function RoleSelect({ onSelectRole }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500">

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">
        Select Your Role
      </h1>

      {/* Cards Container */}
      <div className="flex flex-col md:flex-row gap-8">

        {/* Admin Card */}
        <RoleCard
          title="Admin"
          description="Manage users, assets, and system settings"
          icon={<FaUserShield size={40} />}
          onClick={() => onSelectRole("Admin")}
        />

        {/* User Card */}
        <RoleCard
          title="User"
          description="View and manage assigned assets"
          icon={<FaUser size={40} />}
          onClick={() => onSelectRole("User")}
        />

      </div>

      {/* Footer Note */}
      <p className="text-white/80 mt-10 text-sm">
        Asset Management System (AMS IS IT)
      </p>
    </div>
  );
}

export default RoleSelect;