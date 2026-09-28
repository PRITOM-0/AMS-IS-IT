import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children, setIsLoggedIn, onLogout, user }) {
  return (
    <div className="min-h-screen w-full bg-slate-100">
  {/* Fixed Header */}
  <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200 bg-white shadow-sm">
    <Header
      user={user}
      onLogout={onLogout}
      setIsLoggedIn={setIsLoggedIn}
    />
  </header>

  {/* Main Area */}
  <div className="min-h-screen mt-16 ">
    
    {/* Fixed Sidebar - 20% */}
    <aside className=" fixed left-0 top-16 bottom-0 z-40 w-[15%] overflow-y-auto border-r border-indigo-500 bg-white">
      <Sidebar user={user} />
    </aside>

    {/* Main Content - 80% */}
    <main className="ml-[15%] min-h-[calc(100vh-4rem)] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full">
        {children || <Outlet />}
      </div>
    </main>

  </div>
</div>
  );
}

export default Layout;
