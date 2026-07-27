import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Splash from "../pages/Splash";
import RoleSelect from "../pages/RoleSelect";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Assets from "../pages/Assets";
import Users from "../pages/Users";
import Requests from "../pages/Requests";

// Layout
import Layout from "../components/Layout";

function AppRoutes({ isLoading, role, isLoggedIn, setRole, setIsLoggedIn }) {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash Screen */}
        {isLoading && <Route path="*" element={<Splash />} />}

        {/* Role Selection */}
        {!isLoading && !role && (
          <Route path="/" element={<RoleSelect onSelectRole={setRole} />} />
        )}

        {/* Login */}
        {!isLoading && role && !isLoggedIn && (
          <Route
            path="/login"
            element={<Login role={role} onLogin={() => setIsLoggedIn(true)} />}
          />
        )}

        {/* Protected Routes (UI only) */}
        {!isLoading && isLoggedIn && (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="users" element={<Users />} />
            <Route path="requests" element={<Requests />} />
            <Route path="settings" element={<div className="p-6">Settings page coming soon.</div>} />
          </Route>
        )}

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;