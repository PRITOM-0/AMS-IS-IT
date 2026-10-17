
import { Link } from "react-router-dom";
import { UserRoundCheck } from "lucide-react";

// Product warranty and expected life in years
const productLife = {
  monitor: { warranty: 3, agLife: 8 },
  laptop: { warranty: 2, agLife: 5 },
  headphone: { warranty: 1, agLife: 2 },
  Webcam: { warranty: 1, agLife: 5 },
  cpu: { warranty: 2, agLife: 8 },
  router: { warranty: 1, agLife: 5 },
  printer: { warranty: 1, agLife: 8 },
  ups: { warranty: 1, agLife: 8 },
  scanner: { warranty: 1, agLife: 8 },
  "switch": { warranty: 1, agLife: 10 },
  "access control": { warranty: 1, agLife: 10 },
  "cctv camera": { warranty: 1, agLife: 10 },
  "camera": { warranty: 1, agLife: 10 },
  projector: { warranty: 1, agLife: 7 },
  "smoke detector": { warranty: 1, agLife: 10 },
  photocopier: { warranty: 1, agLife: 7 },
  "pos printer": { warranty: 1, agLife: 7 },
  nvr: { warranty: 1, agLife: 10 },
  xvr: { warranty: 1, agLife: 10 },
  dvr: { warranty: 1, agLife: 10 },
  tab: { warranty: 1, agLife: 4 },
  "smart board": { warranty: 1, agLife: 10 },
  "smoke detector control panel": { warranty: 1, agLife: 10 },
  "pa system control panel": { warranty: 1, agLife: 10 },
  "microphone -pa system": { warranty: 1, agLife: 5 },
  "barcode scanner": { warranty: 1, agLife: 7 },
  "id card printer": { warranty: 1, agLife: 10 },
  tv: { warranty: 1, agLife: 10 },
  "online ups": { warranty: 1, agLife: 5 },
  "barcode printer": { warranty: 1, agLife: 7 },
  "all-in-one pc": { warranty: 2, agLife: 5 },
  server: { warranty: 3, agLife: 8 },
  mobile: { warranty: 1, agLife: 5 },
};

const AssetCard = ({ asset }) => {
  if (!asset) return null;

  const {
    _id,
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
    purchaseDate,
  } = asset;

  // Status badge colors
  let badgeStyle =
    "bg-slate-100 text-slate-700 border-slate-300";

  if (status === "Active") {
    badgeStyle =
      "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (status === "Instock") {
    badgeStyle =
      "bg-blue-100 text-blue-800 border-blue-300";
  } else if (status === "Inactive" || status === "Death") {
    badgeStyle =
      "bg-rose-100 text-rose-800 border-rose-300";
  } else if (status === "Removal") {
    badgeStyle =
      "bg-amber-100 text-amber-800 border-amber-300";
  }

  // Normalize equipment name for lookup
  const equipmentKey = (equipment || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const life = productLife[equipmentKey];

  // Calculate asset age
  const parsedPurchaseDate = purchaseDate
    ? new Date(purchaseDate)
    : null;

  const validPurchaseDate =
    parsedPurchaseDate &&
    !Number.isNaN(parsedPurchaseDate.getTime()) &&
    parsedPurchaseDate <= new Date();

  const ageInYears = validPurchaseDate
    ? (Date.now() - parsedPurchaseDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    : null;

  // Default: No purchase date / unknown information
  let lifeCategory = "No Purchase Date";
  
  let cardBg =
    "border-sky-200 bg-gradient-to-br from-sky-50 via-sky-50/70 to-slate-50";

  if (validPurchaseDate && life && ageInYears !== null) {
    if (ageInYears >= life.agLife) {
      lifeCategory = "No Life";
      cardBg =
        "border-rose-400 bg-gradient-to-br from-rose-200 via-rose-50/70 to-white";
    } else if (ageInYears >= life.warranty) {
      lifeCategory = "Warranty Expired";
      cardBg =
        "border-amber-200 bg-gradient-to-br from-amber-200 via-amber-50/70 to-white";
    } else {
      lifeCategory = "Has Life";
      cardBg =
        "border-emerald-200 bg-gradient-to-br from-emerald-200 via-emerald-50/70 to-white";
    }
  }

  return (
    <Link
      to={`/assets/${_id}`}
      className={`block min-w-0 rounded-[24px] border border-t-4 ${cardBg} p-5 text-slate-800 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.20)] backdrop-blur-sm transition-all duration-200 hover:border-indigo-400 hover:shadow-[0_25px_50px_-20px_rgba(79,70,229,0.25)]`}
    >
      {/* Equipment and status */}
      <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
        <h2
          className="min-w-0 flex-1 truncate text-md font-bold leading-snug tracking-tight text-slate-900"
          title={equipment}
        >
          {equipment || "Unknown Equipment"}
        </h2>

        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}
        >
          {status || "Unknown"}
        </span>
      </div>

      {/* Asset code */}
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Code:
        </span>

        <span
          className="min-w-0 truncate rounded-lg border border-indigo-200 bg-white/70 px-2 py-0.5 font-mono text-xs font-bold text-indigo-600"
          title={assetCode}
        >
          {assetCode || "N/A"}
        </span>
      </div>

      {/* Life category */}
      <div className="">
        <span
          className={`inline-flex rounded-full border px-1 py-1 text-[9px] font-semibold ${
            lifeCategory === "Has Life"
              ? "border-emerald-200 bg-emerald-100/70 text-emerald-800"
              : lifeCategory === "Warranty Expired"
              ? "border-amber-200 bg-amber-100/70 text-amber-800"
              : lifeCategory === "No Life"
              ? "border-rose-200 bg-rose-100/70 text-rose-800"
              : "border-sky-200 bg-sky-100/70 text-sky-800"
          }`}
        >
          {lifeCategory}<span className="ml-1 text-[9px] font-normal text-slate-500">
            {purchaseDate}
          </span>
        </span>
        
      </div>

      {/* Equipment details */}
      {(brand || model || serialNumber || macAddress) && (
        <>
          <hr className="my-3 border-slate-300/80" />

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            {brand && (
              <p className="min-w-0 truncate" title={brand}>
                <strong className="font-semibold text-slate-700">
                  Brand:
                </strong>
                <br />
                {brand}
              </p>
            )}

            {model && (
              <p className="min-w-0 truncate" title={model}>
                <strong className="font-semibold text-slate-700">
                  Model:
                </strong>
                <br />
                {model}
              </p>
            )}
          </div>
        </>
      )}

      {/* Location details */}
      {(location || department || floor || room) && (
        <div className="mt-3 min-w-0">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Location
          </span>

          <hr className="mb-2 border-slate-300/80" />

          <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
            {location && (
              <p
                className="truncate font-medium text-slate-700"
                title={location}
              >
                {location}
              </p>
            )}
            {floor && (
              <p className="truncate text-slate-500" title={floor}>
                {floor}
              </p>
            )}

            {department && (
              <p
                className="truncate font-medium text-slate-700"
                title={department}
              >
                {department}
              </p>
            )}

            

            {room && (
              <p className="truncate text-slate-500" title={room}>
                {room}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Assigned user */}
      {userName && (
        <div className="mt-3 min-w-0">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Assigned To
          </span>

          <hr className="mb-2 border-slate-300/80" />

          <div className="flex min-w-0 items-center space-x-2 text-xs font-medium text-slate-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100/70 text-indigo-600">
              <UserRoundCheck size={17} strokeWidth={2.5} />
            </span>

            <span
              className="min-w-0 truncate"
              title={`${userName}${userCode ? ` - ${userCode}` : ""}`}
            >
              {userName}
              {userCode ? ` - ${userCode}` : ""}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
};

export default AssetCard;
