import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children, setIsLoggedIn }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
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
          className={`flex-1 overflow-y-auto p-2 transition-all duration-300  ml-60 `}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;