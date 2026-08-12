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
    userDetails,
  } = asset;

  return (
    <Link
      to={`/assets/${id}`}
      className="block border  shadow-sm p-4 hover:shadow-md transition duration-200 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{equipment}</h2>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-black-900 font-bold mb-1">
          <strong className="text-gray-700 font-semibold">Code:</strong>{" "}
          {assetCode}
        </p>
        <span
          className={`text-sm px-2 py-1 rounded-full ${
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

      <p className="text-sm text-gray-600 mb-1">
        <strong>Equipment:</strong> {equipment}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
        <span>
          <strong>Location:</strong> {location}
        </span>

        {department && (
          <span>
            <strong>Dept:</strong> {department}
          </span>
        )}

        {floor && (
          <span>
            <strong>Floor:</strong> {floor}th
          </span>
        )}

        {room && (
          <span>
            <strong>Room:</strong> {room}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">
        <strong>Brand:</strong> {brand}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <strong>Model:</strong> {model}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <strong>Serial Number:</strong> {serialNumber}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <strong>MAC:</strong> {macAddress}
      </p>
      {userDetails && userDetails.name && (
        <p className="text-sm text-blue-600 mb-1">
          <strong>Assigned To:</strong> {userDetails.userCode} -{" "}
          {userDetails.userName}
        </p>
      )}
    </Link>
  );
};

export default AssetCard;
