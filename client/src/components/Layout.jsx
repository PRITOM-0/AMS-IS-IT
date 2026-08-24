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
          className={`flex-1 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] overflow-y-auto transition-all duration-300  ml-50 `}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;