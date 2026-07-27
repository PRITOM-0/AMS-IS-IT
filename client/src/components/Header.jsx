import React, { useEffect, useState } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

function Header({ onLogout, setIsLoggedIn }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString();
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-md flex items-center justify-between pl-2 pr-6 z-50">
      
      {/* Left: Logo + Name */}
      <div className="flex items-center gap-1">
        <img
          src="/logo.png"
          alt="logo"
          className="h-18 w-18 object-contain"
        />
        <h1 className="text-xl font-bold text-gray-800">AMS IS-IT</h1>
      </div>

      {/* Right: Time + Profile + Logout */}
      <div className="flex items-center gap-6">
        
        {/* Time */}
        <span className="text-gray-600 font-medium">{time}</span>

        {/* Profile Icon */}
        <FaUserCircle className="text-2xl text-gray-700 cursor-pointer" />

        {/* Logout */}
        <button
          onClick={() => {
            if (onLogout) onLogout();
            if (setIsLoggedIn) setIsLoggedIn(false);
          }}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;