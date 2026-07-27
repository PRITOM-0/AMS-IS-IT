import React from "react";

function Splash() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">

      {/* Logo + Title */}
      <div className="flex flex-col items-center animate-fadeIn">
        <img
          src="/logo.png"
          alt="AMS Logo"
          className="w-48 h-48 mb-4 animate-pulse"
        />

        <h1 className="text-white text-3xl font-bold tracking-wide">
          AMS - Asset Management System
        </h1>
      </div>

      {/* Loader */}
      <div className="mt-10">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Subtitle */}
      <p className="text-white/80 mt-6 text-sm animate-fadeIn delay-200">
        Loading your workspace...
      </p>

      {/* Custom Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 2.2s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 1;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Splash;