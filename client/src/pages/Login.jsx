import React, { useState } from "react";

function Login({ role, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Dummy login (no backend)
    if (email && password) {
      onLogin({ email, role });
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Login as {role}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Asset Management System
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Back Option */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Not your role? Go back and select again
        </p>

      </div>
    </div>
  );
}

export default Login;