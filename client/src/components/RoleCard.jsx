import React from "react";

function RoleCard({ title, description, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl shadow-md p-6 w-72 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100"
    >
      {/* Icon */}
      <div className="text-4xl mb-4 text-blue-600">
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h2>

      {/* Description */}
      <p className="text-gray-500 text-sm">
        {description}
      </p>
    </div>
  );
}

export default RoleCard;