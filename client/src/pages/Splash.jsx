import React from "react";

export default function Splash() {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 overflow-hidden select-none">
      
      {/* Background Ambient Glowing Aura */}
      <div className="absolute w-[450px] h-[450px] bg-cyan-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Logo + Title */}
      <div className="relative z-10 flex flex-col items-center animate-fadeIn">
        <div className="relative group">
          {/* Subtle glowing halo behind logo */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-40 animate-glow" />
          
          <img
            src="/logo.png"
            alt="AMS Logo"
            className="relative w-48 h-48 mb-6 object-contain drop-shadow-2xl animate-float"
            onError={(e) => {
              // Fallback inline SVG if /logo.png is not found
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback Icon Container if image missing */}
          <div className="hidden w-48 h-48 mb-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center shadow-2xl animate-float">
            <svg className="w-20 h-20 text-cyan-300 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <h1 className="text-white gap-1 text-3xl sm:text-4xl font-extrabold tracking-wide drop-shadow-md text-center px-4">
          AMS IS-IT <br /> <span className="font-light text-cyan-200">Asset Management System</span>
        </h1>
      </div>

      {/* Loader */}
      <div className="relative z-10 mt-10 flex items-center justify-center">
        <div className="relative w-12 h-12">
          {/* Outer glowing track */}
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 animate-pulse"></div>
          {/* Spinning dual gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-300 border-r-white animate-spin"></div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="relative z-10 text-cyan-100/90 mt-6 text-sm font-medium tracking-wider animate-fadeInDelay">
        Loading your workspace...
      </p>

      {/* Custom Sleek Animations */}
      <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(15px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeInDelay {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fadeInDelay {
          animation: fadeInDelay 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}