import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Components
import Layout from "./components/Layout";

// Pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";
import AddAsset from "./pages/AddAsset";
import EditAsset from "./pages/EditAsset";
import RepairService from "./pages/RepairService";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import AddEmployee from "./pages/AddEmployee";
import AssetAssign from "./pages/AssetAssign";
import Task from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import TaskDetails from "./pages/TaskDetails";
import ImportAssets from "./pages/ImportAssets";
import StoreAssets from "./pages/StoreAssets";
import ExportAssets from "./pages/ExportAssets";
import CategorySearch from "./pages/CategorySearch";
import UserSetting from "./pages/UserSetting";
import VendorSetting from "./pages/VendorSetting";
import CompanyInfoSetting from "./pages/CompanyInfoSetting";

// ==========================================
// API
// ==========================================

import { API_BASE_URL } from "./env";

// ==========================================
// Protected Route
// ==========================================

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==========================================
// App
// ==========================================

function App() {
  // ==========================================
  // Splash
  // ==========================================

  const [loading, setLoading] = useState(true);

  // ==========================================
  // Authentication
  // ==========================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ==========================================
  // Check Authentication
  // ==========================================
  const [user, setUser] = useState(null);

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      const data = await response.json();

      setUser(data.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);

  // ==========================================
  // Logout
  // ==========================================

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggedIn(false);

      // Show splash after logout
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  // ==========================================
  // Show Splash
  // ==========================================

  if (loading) {
    return <Splash />;
  }

  // ==========================================
  // Routes
  // ==========================================

  return (
    <Routes>
      {/* ========================================
          LOGIN
          ======================================== */}

      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
          )
        }
      />

      {/* ========================================
          PROTECTED APPLICATION
          ======================================== */}

      <Route
        path="/"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Layout
              user={user}
              setIsLoggedIn={setIsLoggedIn}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Category Search */}
        <Route path="category-search" element={<CategorySearch />} />

        {/* Assets */}
        <Route path="assets" element={<Assets />} />

        <Route path="assets/addAsset" element={<AddAsset />} />

        <Route path="assets/editAsset/:id" element={<EditAsset />} />

        <Route path="assets/:id" element={<AssetDetails />} />

        <Route path="assets/repairservice/:id" element={<RepairService />} />

        {/* Settings */}
        <Route path="settings/users" element={<UserSetting />} />

        <Route path="settings/vendors" element={<VendorSetting />} />

        <Route path="settings/company-info" element={<CompanyInfoSetting />} />

        {/* Employees */}
        <Route path="employees" element={<Employees />} />

        <Route path="employees/add" element={<AddEmployee />} />

        <Route path="employees/:id" element={<EmployeeDetails />} />

        {/* Assign Assets */}
        <Route path="assign-assets" element={<AssetAssign />} />

        {/* Tasks */}
        <Route path="tasks" element={<Task />} />

        <Route path="tasks/add" element={<AddTask />} />

        <Route path="tasks/:id" element={<TaskDetails />} />

        {/* Import Assets */}
        <Route path="importassets" element={<ImportAssets />} />

        {/* Store Assets */}
        <Route path="assets/store" element={<StoreAssets />} />

        {/* Export Assets */}
        <Route path="exportassets" element={<ExportAssets />} />
      </Route>

      {/* ========================================
          Invalid Route
          ======================================== */}

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
