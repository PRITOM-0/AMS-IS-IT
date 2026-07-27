import React from "react";
import RoleCard from "../components/RoleCard";
import { FaUserShield, FaUser } from "react-icons/fa";

function RoleSelect({ onSelectRole }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500">
      {/* Logo + Title */}
      <h1 className="text-white text-2xl font-bold tracking-wide">
          AMS - Asset Management System
        </h1>
      <div className="flex flex-col items-center animate-fadeIn">
        <img
          src="/logo.png"
          alt="AMS Logo"
          className="w-40 h-40 animate-pulse"
        />
        
      </div>
      {/* Title */}
      <h1 className="text-xl md:text-xl font-bold text-white mb-3 animate-fadeIn">
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
        Copyright © 2026 AMS - All rights reserved.
      </p>
    </div>
  );
}

export default RoleSelect;