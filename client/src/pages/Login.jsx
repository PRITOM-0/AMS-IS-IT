import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "../env";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);

      if (!response.ok) {
        throw new Error("Unable to load users.");
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError("Unable to load users. Please try again.");
    }
  };

  fetchUsers();
}, []);

  // ==========================================
  // Handle Input
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // ==========================================
  // Login
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!formData.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // Get users from JSON Server
      const response = await fetch(`${API_BASE_URL}/users`);

      if (!response.ok) {
        throw new Error("Unable to connect to server.");
      }

      const users = await response.json();

      // Find matching username and password
      const matchedUser = users.find(
        (user) =>
          user.username?.toLowerCase() ===
            formData.username.trim().toLowerCase() &&
          user.password === formData.password,
      );

      // ==========================================
      // Invalid Login
      // ==========================================

      if (!matchedUser) {
        setError("Invalid username or password.");
        setLoading(false);
        return;
      }

      // ==========================================
      // Successful Login
      // ==========================================

      // Store login state
      localStorage.setItem("isLoggedIn", "true");

      // Store logged-in user
      localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));
      // Save login time
localStorage.setItem("loginTime", Date.now().toString());

      // Update App state
      setIsLoggedIn(true);

      // Go to Dashboard
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      {/* Login Container */}
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg shadow-indigo-200 mb-4">
            <Lock size={30} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

          <p className="text-gray-500 mt-2">
            Sign in to your Asset Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white p-7">
          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* ==================================
                Username
                ================================== */}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />

                <select
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading || users.length === 0}
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 appearance-none"
                >
                  <option value="">
                    {users.length === 0
                      ? "Loading users..."
                      : "Select username"}
                  </option>

                  {users.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ==================================
                Password
                ================================== */}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white pl-10 pr-11 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* ==================================
                Login Button
                ================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium shadow-md shadow-indigo-200 transition hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={19} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Information */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              Use the username and password stored in your JSON Server users
              collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
