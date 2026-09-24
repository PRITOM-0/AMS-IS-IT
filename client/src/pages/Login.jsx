import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cpu,
  Activity,
  CheckCircle2,
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
  const [activeHighlight, setActiveHighlight] = useState(0);

  // Rotate through interactive feature highlights every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHighlight((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/usersInfo`);
      

        if (!response.ok) {
          throw new Error("Unable to load users.");
        }

        const data = await response.json();
        console.log("Fetched users:", data.users);
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
        setError("Unable to load users. Please try again.");
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim()) {
      setError("Please select your username.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed. Please try again.");
      }

      const userData = await response.json();

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", JSON.stringify(userData.user));
      localStorage.setItem("loginTime", Date.now().toString());

      setIsLoggedIn(true);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    { title: "Real-time Tracking", desc: "Monitor lifecycle and deployment status instantly", icon: Activity },
    { title: "Enterprise Security", desc: "Role-based authorization and encrypted access", icon: ShieldCheck },
    { title: "Smart Inventory", desc: "Automated audit logs and hardware allocation", icon: Cpu },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 px-6 py-8 relative overflow-hidden">
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Main Split Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-16 items-center relative z-10 animate-fadeIn">
        
        {/* Left Side: Large Interactive Logo, Tagline & Feature Pills */}
        <div className="flex flex-col items-center justify-center md:items-start text-center md:text-left ">
          
          {/* Much Larger Logo Container with Interactive Hover & Glow */}
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-[2.5rem] blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative inline-flex items-center justify-center w-40 h-40  rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/25 transform transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1">
              <img
                src="/logo.png"
                alt="AMS Logo"
                className="w-50 h-50  object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] animate-pulse"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              SYSTEM ONLINE
            </div>

            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
              IS-IT
            </h1>
            <h2 className="text-white/90 text-2xl md:text-3xl font-bold tracking-tight">
              Asset Management System
            </h2>
            <p className="text-white/80 text-sm md:text-base font-normal max-w-md leading-relaxed">
              Streamline, track, and manage your organization's digital and physical assets with maximum efficiency and security.
            </p>
          </div>

          {/* Interactive Feature Carousel Cards */}
          <div className="w-full max-w-md grid grid-cols-3 gap-2.5 pt-2">
            {highlights.map((item, idx) => {
              const IconComp = item.icon;
              const isActive = activeHighlight === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveHighlight(idx)}
                  className={`p-3 rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer text-left flex flex-col justify-between ${
                    isActive
                      ? "bg-white/20 border-white/50 shadow-lg scale-105"
                      : "bg-white/5 border-white/10 hover:bg-white/10 opacity-70"
                  }`}
                >
                  <IconComp size={20} className={isActive ? "text-cyan-300 mb-2" : "text-white/70 mb-2"} />
                  <span className="text-[11px] font-bold text-white leading-tight line-clamp-1">{item.title}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Login Card (Glassmorphism) */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 transition-all duration-300">
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h3>
              <p className="text-gray-500 text-xs mt-1">Please sign in to your authorized account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-700 animate-fadeIn">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Username Selection */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <select
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading || users.length === 0}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-10 text-sm text-gray-800 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-100 appearance-none cursor-pointer"
                  >
                    <option value="">
                      {users.length === 0 ? "Loading users..." : "Select username"
                      }
                    </option>
                    
                    {users.map((user) => (
                      <option key={user._id} value={user.username}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
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
                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-11 text-sm text-gray-800 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-200 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer Information */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400 font-medium">
                &copy; {new Date().getFullYear()} IS-IT, Scholastica Private Limited. All rights reserved.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Keyframe Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;