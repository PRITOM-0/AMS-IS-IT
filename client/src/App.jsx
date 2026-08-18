import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Splash from "./pages/Splash";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Users from "./pages/Users";
import Requests from "./pages/Requests";
import AssetDetails from "./pages/AssetDetails";
import AddAsset from "./pages/AddAsset";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import AddEmployee from "./pages/AddEmployee";
import AssetAssign from "./pages/AssetAssign";
import Issues from "./pages/Issues";
import IssueDetails from "./pages/IssueDetails";
import ImportAssets from "./pages/ImportAssets";
import StoreAssets from "./pages/StoreAssets";
import ExportAssets from "./pages/ExportAssets";
import CategorySearch from "./pages/CategorySearch";

function App() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 sec splash

    return () => clearTimeout(timer);
  }, []);

  // 🔄 Flow Control
  if (loading) {
    return <Splash />;
  }

  if (!role) {
    return <RoleSelect onSelectRole={setRole} />;
  }

  if (!isLoggedIn) {
    return <Login role={role} onLogin={() => setIsLoggedIn(true)} />;
  }

  // ✅ After Login → Routed Dashboard Layout
  return (
    <Routes>
      <Route path="importassets" element={<ImportAssets />} />
      <Route path="/assets/store" element={<StoreAssets />} />
      <Route path="exportassets" element={<ExportAssets />} />

      <Route path="/" element={<Layout setIsLoggedIn={setIsLoggedIn} />}>
        <Route index element={<Dashboard />} />
        <Route path="/category-search" element={<CategorySearch />} />
        <Route path="assets" element={<Assets />} />
        <Route path="assets/addAsset" element={<AddAsset />} />
        <Route path="assets/:id" element={<AssetDetails />} />
        <Route path="users" element={<Users />} />
        <Route path="requests" element={<Requests />} />
        <Route
          path="settings"
          element={<div className="p-6">Settings page coming soon.</div>}
        />
        <Route path="employees" element={<Employees />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="assign-assets" element={<AssetAssign />} />
        <Route path="issues" element={<Issues />} />
        <Route path="/issues/:id" element={<IssueDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
