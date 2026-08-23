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

  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  if (status === "Active")
    badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm";
  else if (status === "Instock")
    badgeStyle = "bg-blue-100 text-blue-800 border-blue-300 shadow-sm";
  else if (status === "Instore")
    badgeStyle = "bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm";
  else if (status === "Inactive" || status === "Death")
    badgeStyle = "bg-rose-100 text-rose-800 border-rose-300 shadow-sm";
  else if (status === "Removal")
    badgeStyle = "bg-amber-100 text-amber-800 border-amber-300 shadow-sm";

  return (
    <Link
      to={`/assets/${id}`}
      className="block rounded-[24px] border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-slate-50/80 p-5 text-slate-800 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.25)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_25px_50px_-20px_rgba(79,70,229,0.35)] min-w-0"
    >
      <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug truncate min-w-0 flex-1" title={equipment}>
          {equipment}
        </h2>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${badgeStyle}`}
        >
          {status || "Unknown"}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3 min-w-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 shrink-0">
          Code:
        </span>
        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-200 px-2 py-0.5 rounded-lg truncate min-w-0" title={assetCode}>
          {assetCode}
        </span>
      </div>

      {(brand || model || serialNumber || macAddress) && (
        <hr className="border-slate-200/80 my-3" />
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        {brand && (
          <p className="truncate" title={brand}>
            <strong className="text-slate-700 font-semibold">Brand: <br /></strong>{" "}
            {brand}
          </p>
        )}
        {model && (
          <p className="truncate" title={model}>
            <strong className="text-slate-700 font-semibold">Model:<br /></strong>{" "}
            {model}
          </p>
        )}
        {serialNumber && (
          <p className="truncate" title={serialNumber}>
            <strong className="text-slate-700 font-semibold">SerialNumber:<br /></strong>{" "}
            {serialNumber}
          </p>
        )}
        {macAddress && (
          <p className="truncate" title={macAddress}>
            <strong className="text-slate-700 font-semibold">MacAddress:<br /></strong>{" "}
            {macAddress}
          </p>
        )}
      </div>

      {(location || department || floor || room) && (
        <div className="mt-3 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">
            Location
          </span>
          <hr className="border-slate-200/80 mb-2" />
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
            {location && <p className="font-medium text-slate-700 truncate" title={location}>{location}</p>}
            {department && <p className="font-medium text-slate-700 truncate" title={department}>{department}</p>}
            {floor && <p className="text-slate-500 truncate" title={floor}>{floor}</p>}
            {room && <p className="text-slate-500 truncate" title={room}>{room}</p>}
          </div>
        </div>
      )}

      {userName && (
        <div className="mt-3 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">
            Assigned To
          </span>
          <hr className="border-slate-200/80 mb-2" />
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 min-w-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-600 shrink-0">
              {userName.charAt(0)}
            </span>
            <span className="truncate min-w-0" title={`${userName} ${userCode ? `- ${userCode}` : ""}`}>
              {userName} {userCode ? `- ${userCode}` : ""}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
};

export default AssetCard;