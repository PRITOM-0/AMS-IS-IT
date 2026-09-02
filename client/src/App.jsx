 
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

const RefreshOn = 60*60*1000;

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
  // Splash Screen
  // ==========================================

  const [loading, setLoading] = useState(() => {
    // Show splash only if it has never been shown
    return localStorage.getItem("loggedInUser") !== null;
  });

  // ==========================================
  // Check Login Session
  // ==========================================

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    // No login information
    if (loggedIn !== "true" || !loginTime) {
      return false;
    }

    // Check if 1 hour has passed
    const sessionExpired =
      Date.now() - Number(loginTime) >= RefreshOn;

    if (sessionExpired) {
      // Remove expired login information
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loginTime");

      return false;
    }

    return true;
  });

  // ==========================================
  // Splash Screen Timer
  // ==========================================

  useEffect(() => {
    // Splash already shown before
    if (localStorage.getItem("hasSeenSplash") === "true") {
      setLoading(false);
      return;
    }

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      localStorage.setItem("hasSeenSplash", "true");
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // Check Session Every Second
  // ==========================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const checkSession = () => {
      const loginTime = localStorage.getItem("loginTime");
      const loggedIn = localStorage.getItem("isLoggedIn");

      if (loggedIn !== "true" || !loginTime) {
        setIsLoggedIn(false);
        return;
      }

      const sessionExpired =
        Date.now() - Number(loginTime) >= RefreshOn;

      if (sessionExpired) {
        // Session expired
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("loginTime");

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
            <Layout setIsLoggedIn={setIsLoggedIn} />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* CATEGORY SEARCH */}
        <Route
          path="category-search"
          element={<CategorySearch />}
        />

        {/* ASSETS */}
        <Route path="assets" element={<Assets />} />

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

        {/* USERS */}
        <Route path="users" element={<Users />} />

        {/* REQUESTS */}
        <Route path="requests" element={<Requests />} />

        {/* SETTINGS */}
        <Route
          path="settings"
          element={
            <Setting   />
          }
        />

        {/* EMPLOYEES */}
        <Route path="employees" element={<Employees />} />

        <Route
          path="employees/add"
          element={<AddEmployee />}
        />

        <Route
          path="employees/:id"
          element={<EmployeeDetails />}
        />

        {/* ASSIGN ASSETS */}
        <Route
          path="assign-assets"
          element={<AssetAssign />}
        />

        {/* TASKS */}
        <Route path="tasks" element={<Task />} />

        <Route
          path="tasks/add"
          element={<AddTask />}
        />

        <Route
          path="tasks/:id"
          element={<TaskDetails />}
        />

        {/* IMPORT / EXPORT / STORE */}
        <Route
          path="importassets"
          element={<ImportAssets />}
        />

        <Route
          path="assets/store"
          element={<StoreAssets />}
        />

        <Route
          path="exportassets"
          element={<ExportAssets />}
        />
      </Route>

      {/* ========================================
          INVALID ROUTE
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
 
