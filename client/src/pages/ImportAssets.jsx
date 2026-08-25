import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  RefreshCw,
  Check,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const demoAsset = {
  id: "",
  equipment: "",
  assetCode: "",
  brand: "",
  model: "",
  serialNumber: "",
  specifications: "",
  macAddress: "",
  department: "",
  location: "",
  floor: "",
  room: "",
  status: "",
  userId: "",
  userCode: "",
  userName: "",
  oldUsers: "",
  receivedDate: "",
  purchaseDate: "",
  purchasePrice: "",
  warrantyStart: "",
  warrantyEnd: "",
  vendorName: "",
  remarks: "",
  upgradeEquipments: "",
  surveyReport: "",
  createdAt: "",
  updatedAt: "",
};

const ASSET_FIELDS = [
  { value: "equipment", label: "Equipment", type: "string" },
  { value: "assetCode", label: "Asset Code", type: "string" },
  { value: "brand", label: "Brand", type: "string" },
  { value: "model", label: "Model", type: "string" },
  { value: "serialNumber", label: "Serial Number", type: "string" },
  { value: "specifications", label: "Specifications", type: "string" },
  { value: "macAddress", label: "MAC Address", type: "string" },
  { value: "department", label: "Department", type: "string" },
  { value: "location", label: "Location", type: "string" },
  { value: "floor", label: "Floor", type: "string" },
  { value: "room", label: "Room", type: "string" },
  { value: "status", label: "Status", type: "string" },
  { value: "userId", label: "User ID", type: "string" },
  { value: "userCode", label: "User Code", type: "string" },
  { value: "userName", label: "User Name", type: "string" },
  { value: "oldUsers", label: "Old User", type: "string" },
  { value: "receivedDate", label: "Received Date", type: "date" },
  { value: "purchaseDate", label: "Purchase Date", type: "date" },
  { value: "purchasePrice", label: "Purchase Price", type: "number" },
  { value: "warrantyStart", label: "Warranty Start", type: "date" },
  { value: "warrantyEnd", label: "Warranty End", type: "date" },
  { value: "vendorName", label: "Vendor Name", type: "string" },
  { value: "remarks", label: "Remarks", type: "string" },
  { value: "upgradeEquipments", label: "Upgrade Equipments", type: "string" },
  { value: "surveyReport", label: "Survey Report", type: "string" },
  { value: "createdAt", label: "Created At", type: "datetime" },
  { value: "updatedAt", label: "Updated At", type: "datetime" },
];

const ASSET_ALIAS_MAP = {
  equipment: ["equipment", "asset", "item", "itemname", "equipmentname"],
  assetCode: ["assetcode", "assetid", "code", "assetno", "assetnumber"],
  brand: ["brand", "manufacturer", "make", "company"],
  model: ["model", "modelnumber", "modelname"],
  serialNumber: ["serialnumber", "serialno", "serial", "sn"],
  specifications: ["specifications", "configuration/specification", "configuration", "description"],
  macAddress: ["macaddress", "mac", "macid"],
  department: ["department", "dept", "division"],
  location: ["location", "location/campus", "campus", "building", "office"],
  floor: ["floor", "office/floor/building/room", "level"],
  room: ["room", "roomno", "roomnumber", "roomname"],
  status: ["status", "assetstatus", "condition"],
  userId: ["userid", "currentuserid"],
  userCode: ["usercode", "employeeid", "employeecode", "empid"],
  userName: ["username", "employeename", "assignedto", "user"],
  oldUsers: ["olduser", "Old User Name", "Old User"],
  receivedDate: ["User Received Date"],
  purchaseDate: ["purchasedate", "buydate", "dateofpurchase", "purchase"],
  purchasePrice: ["purchaseprice", "price", "cost", "amount"],
  warrantyStart: ["warrantystart", "warrantyfrom", "warrantybegin"],
  warrantyEnd: ["warrantyend", "warrantyto", "warranty", "warrantyexpirydate"],
  vendorName: ["vendorname", "vendor", "supplier", "suppliername"],
  remarks: ["remarks", "remark", "notes", "comment", "comments"],
  surveyReport: ["surveyreport", "survey", "it survey report", "inspection"], 
  upgradeEquipments: ["upgradeEquipments", "Upgrade Equipment"],
  createdAt: ["createdat", "createddate"],
  updatedAt: ["updatedat", "updateddate"],
};

const normalize = (val) => String(val || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const isEmptyColumnName = (name) => {
  if (name === null || name === undefined) return true;
  const value = String(name).trim();
  if (!value || value === "undefined") return true;
  return /^(__EMPTY|Unnamed:)/i.test(value) || /^__EMPTY_\d+$/i.test(value);
};

const findMatchField = (columnName) => {
  const normalizedColumn = normalize(columnName);
  for (const [fieldName, aliases] of Object.entries(ASSET_ALIAS_MAP)) {
    if (aliases.some((alias) => normalize(alias) === normalizedColumn)) {
      return fieldName;
    }
  }
  return "";
};

const setNestedValue = (target, path, value) => {
  const keys = path.split(".");
  let current = target;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
      return;
    }
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  });
};

const formatDateTime = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const month = String(parsed.m || 1).padStart(2, "0");
      const day = String(parsed.d || 1).padStart(2, "0");
      return `${parsed.y}-${month}-${day}T00:00:00.000Z`;
    }
  }
  const parsedDate = new Date(String(value).trim());
  return !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : String(value).trim();
};

const convertCellValue = (value, fieldName) => {
  if (value === null || value === undefined || String(value).trim() === "") return "";
  const dateFields = [
    "purchaseDate", "receivedDate", "warrantyStart", "warrantyEnd", "createdAt", "updatedAt",
  ];
  if (dateFields.includes(fieldName)) return formatDateTime(value);
  if (fieldName === "purchasePrice") return /^[0-9.]*$/.test(String(value)) ? value : "";
  return String(value).trim();
};

const removeEmptyColumnsAndRows = (rows) => {
  if (!rows.length) return { columns: [], rows: [] };

  const validColumns = Object.keys(rows[0]).filter((col) => !isEmptyColumnName(col));

  // Find the raw column name that corresponds to 'equipment'
  const equipmentColumn = validColumns.find(
    (col) => findMatchField(col) === "equipment"
  );

  const cleanedRows = rows
    .map((row) => {
      const newRow = {};
      validColumns.forEach((col) => { newRow[col] = row[col]; });
      return newRow;
    })
    .filter((row) => {
      // 1. Must not be completely blank
      const isNotEmpty = Object.values(row).some((val) => String(val ?? "").trim() !== "");
      
      // 2. Must contain a non-empty Equipment value (if equipment column was auto-mapped)
      const hasEquipment = equipmentColumn 
        ? String(row[equipmentColumn] ?? "").trim() !== "" 
        : true;

      return isNotEmpty && hasEquipment;
    });

  return { columns: validColumns, rows: cleanedRows };
};

const buildAssetFromRow = (row, rowIndex, mapping) => {
  const asset = {
    ...demoAsset,
    id: `${Date.now()}-${rowIndex}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  Object.entries(mapping).forEach(([excelColumn, assetField]) => {
    if (!assetField || !(excelColumn in row)) return;
    const convertedValue = convertCellValue(row[excelColumn], assetField);
    if (!convertedValue) return;

    if (assetField.includes(".")) {
      setNestedValue(asset, assetField, convertedValue);
    } else {
      asset[assetField] = convertedValue;
    }
  });

  return asset;
};

const ImportAssets = () => {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setSuccess(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const workbook = XLSX.read(new Uint8Array(loadEvent.target.result), { type: "array", cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: true });

        if (!rawRows.length) {
          setSuccess(false);
          setMessage("Excel file is empty.");
          setLoading(false);
          return;
        }

        const { columns: validColumns, rows: validRows } = removeEmptyColumnsAndRows(rawRows);

        if (!validColumns.length || !validRows.length) {
          setSuccess(false);
          setMessage("No valid data found. Rows without an Equipment value or empty columns were removed.");
          setLoading(false);
          return;
        }

        const autoMapping = {};
        validColumns.forEach((col) => { autoMapping[col] = findMatchField(col); });

        setColumns(validColumns);
        setExcelData(validRows);
        setMapping(autoMapping);
        setSuccess(true);
        setMessage(`Loaded ${validRows.length} valid rows (rows missing equipment were skipped).`);
      } catch (error) {
        console.error(error);
        setSuccess(false);
        setMessage("Unable to read the Excel file.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const handleMappingChange = (excelColumn, assetField) => {
    setMapping((prev) => ({ ...prev, [excelColumn]: assetField }));
  };

  const validateAndProceed = () => {
    const values = Object.values(mapping).filter(Boolean);

    const seen = new Set();
    const duplicates = new Set();
    values.forEach((v) => {
      if (seen.has(v)) duplicates.add(v);
      seen.add(v);
    });

    if (duplicates.size > 0) {
      setSuccess(false);
      setMessage("Each asset field should be mapped only once. Please fix duplicate mappings.");
      return;
    }

    // Build final assets and strictly exclude any row missing the equipment field
    const finalAssets = excelData
      .map((row, index) => buildAssetFromRow(row, index, mapping))
      .filter((asset) => String(asset.equipment || "").trim() !== "");

    if (!finalAssets.length) {
      setSuccess(false);
      setMessage("No valid rows remaining. Ensure 'Equipment' field is properly mapped and not empty.");
      return;
    }

    navigate("/assets/store", { state: { assets: finalAssets, fileName } });
  };

  const resetImport = () => {
    setExcelData([]);
    setColumns([]);
    setMapping({});
    setFileName("");
    setMessage("");
    setSuccess(true);
  };

  return (
    <div className="min-h-screen rounded-2xl border border-indigo-400 shadow-2xl bg-white p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/assets", { replace: true })}
              className="mb-3 inline-flex items-center gap-2 rounded-xl border border-indigo-400 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 hover:text-indigo-600 transition-all duration-150 active:scale-[0.98]"
            >
              <ArrowLeft size={15} className="text-indigo-600" /> Back to Assets
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Import Assets</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Upload Excel <span className="text-indigo-400 mx-1">•</span> Clean data <span className="text-indigo-400 mx-1">•</span> Map fields <span className="text-indigo-400 mx-1">•</span> Store to DB
                </p>
              </div>
            </div>
          </div>

          {excelData.length > 0 && (
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-indigo-400 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all active:scale-[0.98]"
            >
              <RefreshCw size={15} className="text-indigo-600" /> Upload Another File
            </button>
          )}
        </div>

        {/* Alert Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-start sm:items-center gap-3 shadow-sm transition-all ${
              success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {success ? (
              <FileSpreadsheet size={18} className="text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <p className="text-xs sm:text-sm font-medium">{message}</p>
          </div>
        )}

        {/* File Upload State */}
        {excelData.length === 0 ? (
          <div className="bg-white border border-indigo-400 rounded-2xl p-8 sm:p-14 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 border border-indigo-500 flex items-center justify-center text-indigo-600 shadow-inner mb-5">
                <Upload size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upload Excel Spreadsheet</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Supports <span className="font-semibold text-indigo-600">.xlsx</span>, <span className="font-semibold text-indigo-600">.xls</span>, or <span className="font-semibold text-indigo-600">.csv</span>. Blank rows and missing equipment records are auto-cleaned.
              </p>

              <label className="mt-7 inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-500/25 active:scale-[0.98] transition-all">
                {loading ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" /> Reading File...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={17} /> Choose Excel File
                  </>
                )}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        ) : (
          /* Field Mapping State */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                  {columns.length}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Map Excel Columns</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match source spreadsheet columns with asset database schema
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-sm">
                  File: <strong className="ml-1 text-indigo-600 font-semibold">{fileName}</strong>
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {excelData.length} Rows
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {columns.map((column) => {
                const isMapped = Boolean(mapping[column]);
                return (
                  <div
                    key={column}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-3 p-4 sm:px-6 items-center transition-colors ${
                      isMapped ? "bg-indigo-50/20" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="md:col-span-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isMapped ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                        ></span>
                        <p className="text-sm font-semibold text-slate-900">{column}</p>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 truncate pl-4">
                        <span className="shrink-0 text-slate-400">Sample:</span>
                        <span className="font-mono bg-slate-100 text-indigo-700 px-2 py-0.5 rounded text-xs border border-slate-200/60 truncate">
                          {String(excelData[0]?.[column] ?? "N/A")}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-7">
                      <select
                        value={mapping[column] || ""}
                        onChange={(e) => handleMappingChange(column, e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 ${
                          isMapped
                            ? "bg-indigo-50/50 border-indigo-300 text-indigo-900 focus:ring-indigo-500/20 focus:border-indigo-500"
                            : "bg-white border-slate-300 text-slate-500 focus:ring-slate-900/10 focus:border-slate-400"
                        }`}
                      >
                        <option value="">-- Select Target Asset Field --</option>
                        {ASSET_FIELDS.map((field) => (
                          <option key={field.value} value={field.value} className="text-slate-800">
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <p className="text-xs text-slate-500 hidden sm:block">
                Map <span className="font-semibold text-indigo-600">Equipment</span> & <span className="font-semibold text-indigo-600">Asset Code</span> to proceed.
              </p>
              <button
                onClick={validateAndProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
              >
                <Check size={16} /> Proceed to Review & Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportAssets;