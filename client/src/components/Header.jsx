import React, { useEffect, useState } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

function Header({ onLogout, setIsLoggedIn }) {
  const [time, setTime] = useState("");
  const loggedInUser = JSON.parse(
  localStorage.getItem("loggedInUser") || "{}"
);

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

 const handleLogout = () => {
  // Clear login information
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("loginTime");

  // Let App.jsx handle:
  // 1. setIsLoggedIn(false)
  // 2. show splash
  // 3. navigate to login
  if (onLogout) {
    onLogout();
    return;
  }

  // Fallback if onLogout is not provided
  if (setIsLoggedIn) {
    setIsLoggedIn(false);
  }
};
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-md flex items-center justify-between pl-2 pr-6 z-50">
      
      {/* Left: Logo + Name */}
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <img
          src="/logo.png"
          alt="logo"
          className="h-18 w-18 object-contain"
        />

        <h1 className="text-xl font-bold text-gray-800">
          Asset Management System IS-IT
        </h1>
      </div>

      {/* Right: Time + Profile + Logout */}
      <div className="flex items-center gap-6">

        {/* Time */}
        <span className="text-gray-600 font-medium">
          {time}
        </span>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Profile name */}
        <span className="text-gray-600 font-medium">
  {loggedInUser.username || "User"}
</span>

        {/* Profile Icon */}
        <FaUserCircle className="text-blue-600 text-2xl" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;