import React from "react";

function Loader({ fullScreen = false, text = "Loading..." }) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "h-screen w-full" : "py-10"
      }`}
    >
      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
      </div>

      {/* Loading Text */}
      <p className="mt-4 text-gray-600 text-sm">{text}</p>
    </div>
  );
}

export default Loader;