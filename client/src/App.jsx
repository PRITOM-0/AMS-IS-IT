 
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Components
import Layout from "./components/Layout";

// Pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Users from "./pages/Users";
import Requests from "./pages/Requests";
import AssetDetails from "./pages/AssetDetails";
import AddAsset from "./pages/AddAsset";
import EditAsset from "./pages/EditAsset";
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
import Setting from "./pages/Setting";

// ==========================================
// Session Configuration
// ==========================================

const RefreshOn = 60 * 60 * 1000; // 1 hour

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
  // Splash State
  // ==========================================
  //
  // IMPORTANT:
  // false = no splash
  // true  = show splash
  //
  // So refreshing the browser will NOT show splash.
  // Logout will manually set this to true.
  // ==========================================

  const [loading, setLoading] = useState(false);

  // ==========================================
  // Login Session
  // ==========================================

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    if (loggedIn !== "true" || !loginTime) {
      return false;
    }

    // Check if 1 hour has passed
    const sessionExpired =
      Date.now() - Number(loginTime) >= RefreshOn;

    if (sessionExpired) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loginTime");

      return false;
    }

    return true;
  });

  // ==========================================
  // Splash Timer
  // ==========================================

  useEffect(() => {
    if (!loading) {
      return;
    }

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading]);

  // ==========================================
  // Session Check
  // ==========================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const checkSession = () => {
      const loginTime = localStorage.getItem("loginTime");
      const loggedIn = localStorage.getItem("isLoggedIn");

      // Session information missing
      if (loggedIn !== "true" || !loginTime) {
        setIsLoggedIn(false);
        return;
      }

      // Check expiration
      const sessionExpired =
        Date.now() - Number(loginTime) >= RefreshOn;

      if (sessionExpired) {
        // Remove session
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("loginTime");

        // Show splash before login
        setLoading(true);

        // Logout user
        setIsLoggedIn(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every second
    const interval = setInterval(checkSession, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // ==========================================
  // Logout
  // ==========================================

  const handleLogout = () => {
    // Remove session
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loginTime");

    // Logout
    setIsLoggedIn(false);

    // Show splash
    setLoading(true);
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
            <Login setIsLoggedIn={setIsLoggedIn} />
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
              setIsLoggedIn={setIsLoggedIn}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Category Search */}
        <Route
          path="category-search"
          element={<CategorySearch />}
        />

        {/* Assets */}
        <Route
          path="assets"
          element={<Assets />}
        />

        <Route
          path="assets/addAsset"
          element={<AddAsset />}
        />

        <Route
          path="assets/editAsset/:id"
          element={<EditAsset />}
        />

        <Route
          path="assets/:id"
          element={<AssetDetails />}
        />

        {/* Users */}
        <Route
          path="users"
          element={<Users />}
        />

        {/* Requests */}
        <Route
          path="requests"
          element={<Requests />}
        />

        {/* Settings */}
        <Route
          path="settings"
          element={<Setting />}
        />

        {/* Employees */}
        <Route
          path="employees"
          element={<Employees />}
        />

        <Route
          path="employees/add"
          element={<AddEmployee />}
        />

        <Route
          path="employees/:id"
          element={<EmployeeDetails />}
        />

        {/* Assign Assets */}
        <Route
          path="assign-assets"
          element={<AssetAssign />}
        />

        {/* Tasks */}
        <Route
          path="tasks"
          element={<Task />}
        />

        <Route
          path="tasks/add"
          element={<AddTask />}
        />

        <Route
          path="tasks/:id"
          element={<TaskDetails />}
        />

        {/* Import Assets */}
        <Route
          path="importassets"
          element={<ImportAssets />}
        />

        {/* Store Assets */}
        <Route
          path="assets/store"
          element={<StoreAssets />}
        />

        {/* Export Assets */}
        <Route
          path="exportassets"
          element={<ExportAssets />}
        />
      </Route>

      {/* ========================================
          Invalid Route
          ======================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={isLoggedIn ? "/" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
 
