import React from "react";
import { Link } from "react-router-dom";

const AssetCard = ({ asset }) => {
  if (!asset) return null;

  const {
    id,
    assetCode,
    equipment,
    brand,
    model,
    serialNumber,
    macAddress,
    location,
    department,
    floor,
    room,
    status,
    userName,
    userCode,
  } = asset;

  return (
    <Link
      to={`/assets/${id}`}
      className="block border  shadow-sm p-4 hover:shadow-md transition duration-200 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{equipment}</h2>
      </div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-black-900 font-bold mb-1">
          <strong className="text-gray-700 font-semibold">Code:</strong>{" "}
          {assetCode}
        </p>
        <span
          className={`text-sm px-2 py-2 rounded-full ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : status === "Inactive"
                ? "bg-red-100 text-red-600"
                : status === "Instore"
                  ? "bg-yellow-100 text-blue-700"
                  : status === "Under Repair"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "Death"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      </div>
      {(brand || model ||serialNumber||macAddress) && <hr/>}
      <div className="grid grid-cols-2">
        
        {brand && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>Brand:</strong> {brand}
          </p>
        )}
        {model && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>Model:</strong> {model}
          </p>
        )}
        {serialNumber && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>SerialNumber:</strong> {serialNumber}
          </p>
        )}
        {macAddress && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>MacAddress:</strong> {macAddress}
          </p>
        )}
      </div>
      <strong className="text-gray-600 my-2">
        Location: <hr />
      </strong>
      <div className="grid grid-cols-2">
        {location && (
          <p className="text-sm text-gray-600 mb-1">
            <p >{location}</p> 
          </p>
        )}
        {department && (
          <p className="text-sm text-gray-600 mb-1">
            <p > {department}</p>
          </p>
        )}
        {floor && (
          <p className="text-sm text-gray-600 mb-1">
            <p>{floor}</p> 
          </p>
        )}
        {room && (
          <p className="text-sm text-gray-600 mb-1">
            <p > {room}</p> 
          </p>
        )}
      </div>
      {userName && (
        <p className="text-sm text-gray-600 mb-1">
          <strong>
            Assigned To: <hr />
          </strong>
          <span>{userName} - </span>
          <span>{userCode}</span>
        </p>
      )}
    </Link>
  );
};

export default AssetCard;
