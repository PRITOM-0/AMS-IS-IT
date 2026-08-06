import React from "react";
import { Link } from "react-router-dom";

const AssetCard = ({asset}) => {
  if (!asset) return null;

  const {
    id,
    assetCode,
    name,
    category,
    location,
    status,
    assignDetails, 
    issues,  
  } = asset;

  return (
    <Link
      to={`/assets/${id}`}
      className="block border rounded-xl shadow-sm p-4 hover:shadow-md transition duration-200 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{name}</h2>
        
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-black-900 font-bold mb-1">
          <strong className="text-gray-700 font-semibold">Code:</strong> {assetCode}
        </p>
        <span
          className={`text-sm px-2 py-1 rounded-full ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : status === "Inactive"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-1">
        <strong>Category:</strong> {category}
      </p>

      <p className="text-sm text-gray-600 mb-1">
        <strong>Location:</strong> {location}
      </p>
      {assignDetails && assignDetails.assignedTo && (
        <p className="text-sm text-blue-600 mb-1">
          <strong>Assigned To:</strong> {assignDetails.assignedTo}
        </p>
      )}
      {issues.length > 0 && (
        <p className="text-sm text-red-600 mt-2">
          <strong>Issues:</strong> {issues}
        </p>
      )}
      
    </Link>
  );
};

export default AssetCard;