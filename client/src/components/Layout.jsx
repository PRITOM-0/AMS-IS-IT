import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children, setIsLoggedIn }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-full  flex flex-col bg-gray-100">
      {/* 🔝 Header */}
      <Header
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        setIsLoggedIn={setIsLoggedIn}
      />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* 📚 Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* 📄 Main Content */}
        <main
          className={`flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.28),_transparent_50%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.20),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(244,114,182,0.16),_transparent_50%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_50%,_#fdf2f8_100%)] overflow-y-auto transition-all duration-300  ml-56 `}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;