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

function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      <Route path="/" element={<Layout setIsLoggedIn={setIsLoggedIn} />}>
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="users" element={<Users />} />
        <Route path="requests" element={<Requests />} />
        <Route
          path="settings"
          element={<div className="p-6">Settings page coming soon.</div>}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;