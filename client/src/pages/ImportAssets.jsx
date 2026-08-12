import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  RefreshCw,
  Check,
  AlertCircle,
  Database,
  ArrowLeft
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
  status: "Instore",
  userId: "",
  userCode: "",
  userName: "",
  oldUsers: {
    userId: "",
    userCode: "",
    userName: "",
    receivedDate: "",
    returnedDate: "",
    issues: [],
  },
  receivedDate: "",
  purchaseDate: "",
  purchasePrice: "",
  warrantyStart: "",
  warrantyEnd: "",
  vendorName: "",
  remarks: "",
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
  { value: "oldUsers.userId", label: "Old User ID", type: "string" },
  { value: "oldUsers.userCode", label: "Old User Code", type: "string" },
  { value: "oldUsers.userName", label: "Old User Name", type: "string" },
  {
    value: "oldUsers.receivedDate",
    label: "Old User Received Date",
    type: "date",
  },
  {
    value: "oldUsers.returnedDate",
    label: "Old User Returned Date",
    type: "date",
  },
  { value: "receivedDate", label: "Received Date", type: "date" },
  { value: "purchaseDate", label: "Purchase Date", type: "date" },
  { value: "purchasePrice", label: "Purchase Price", type: "number" },
  { value: "warrantyStart", label: "Warranty Start", type: "date" },
  { value: "warrantyEnd", label: "Warranty End", type: "date" },
  { value: "vendorName", label: "Vendor Name", type: "string" },
  { value: "remarks", label: "Remarks", type: "string" },
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
  specifications: [
    "specifications",
    "Configuration/Specification",
    "configuration",
    "description",
  ],
  macAddress: ["macaddress", "mac", "macid"],
  department: ["department", "dept", "division"],
  location: ["location", "Location/Campus", "campus", "building", "office"],
  floor: ["floor", "office/floor/building/Room", "level"],
  room: ["room", "roomno", "roomnumber", "roomname"],
  status: ["status", "assetstatus", "condition"],
  userId: ["userid", "currentuserid"],
  userCode: ["usercode", "employeeid", "employeecode", "empid"],
  userName: ["username", "employeename", "assignedto", "user"],
  "oldUsers.userId": ["olduserid", "previoususerid", "formeruserid"],
  "oldUsers.userCode": ["oldusercode", "previoususercode", "formerusercode"],
  "oldUsers.userName": ["oldusername", "previoususername", "formerusername"],
  "oldUsers.receivedDate": ["oldreceiveddate", "previousreceiveddate"],
  "oldUsers.returnedDate": ["returneddate", "returndate", "oldreturneddate"],
  receivedDate: [
    "receiveddate",
    "assigneddate",
    "issueddate",
    "userreceiveddate",
  ],
  purchaseDate: ["purchasedate", "buydate", "dateofpurchase", "purchase"],
  purchasePrice: ["purchaseprice", "price", "cost", "amount"],
  warrantyStart: ["warrantystart", "warrantyfrom", "warrantybegin"],
  warrantyEnd: ["warrantyend", "warrantyto", "Warranty", "warrantyexpirydate"],
  vendorName: ["vendorname", "vendor", "supplier", "suppliername"],
  remarks: ["remarks", "remark", "notes", "comment", "comments"],
  surveyReport: ["surveyreport", "survey", "IT Survey Report", "inspection"],
  createdAt: ["createdat", "createddate"],
  updatedAt: ["updatedat", "updateddate"],
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const isEmptyColumnName = (name) => {
  if (name === null || name === undefined) return true;

  const value = String(name).trim();
  if (!value || value === "undefined") return true;

  return /^(__EMPTY|Unnamed:)/i.test(value) || /^__EMPTY_\d+$/i.test(value);
};

const findMatchField = (columnName) => {
  const normalizedColumn = normalize(columnName);

  for (const [fieldName, aliases] of Object.entries(ASSET_ALIAS_MAP)) {
    const match = aliases.some(
      (alias) => normalize(alias) === normalizedColumn,
    );
    if (match) return fieldName;
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
  if (value === null || value === undefined || String(value).trim() === "")
    return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const month = String(parsed.m || 1).padStart(2, "0");
      const day = String(parsed.d || 1).padStart(2, "0");
      return `${parsed.y}-${month}-${day}T00:00:00.000Z`;
    }
  }

  const dateText = String(value).trim();
  const parsedDate = new Date(dateText);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }

  return dateText;
};

const convertCellValue = (value, fieldName) => {
  if (value === null || value === undefined || String(value).trim() === "")
    return "";

  const textValue = String(value).trim();

  if (
    [
      "purchaseDate",
      "receivedDate",
      "oldUsers.receivedDate",
      "oldUsers.returnedDate",
      "warrantyStart",
      "warrantyEnd",
      "createdAt",
      "updatedAt",
    ].includes(fieldName)
  ) {
    return formatDateTime(value);
  }

  if (fieldName === "purchasePrice") {
    const isValid = /^[0-9.]*$/.test(String(value));

    return isValid ? value : "";
  }

  return textValue;
};

const removeEmptyColumnsAndRows = (rows) => {
  if (!rows.length) return { columns: [], rows: [] };

  const validColumns = Object.keys(rows[0]).filter(
    (column) => !isEmptyColumnName(column),
  );

  const cleanedRows = rows
    .map((row) => {
      const newRow = {};
      validColumns.forEach((column) => {
        newRow[column] = row[column];
      });
      return newRow;
    })
    .filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim() !== ""),
    );

  return {
    columns: validColumns,
    rows: cleanedRows,
  };
};

const buildAssetFromRow = (row, rowIndex, mapping) => {
  const asset = {
    ...demoAsset,
    id: `asset-${Date.now()}-${rowIndex}`,
    status: "Instore",
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

  if (!asset.assetCode) asset.assetCode = `ASSET-${rowIndex + 1}`;
  if (!asset.status) asset.status = "Instore";
  if (!asset.oldUsers) {
    asset.oldUsers = {
      userId: "",
      userCode: "",
      userName: "",
      receivedDate: "",
      returnedDate: "",
      issues: [],
    };
  }

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
  const [previewMode, setPreviewMode] = useState(false);
   const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setSuccess(true);
    setFileName(file.name);
    setPreviewMode(false);

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const workbook = XLSX.read(new Uint8Array(loadEvent.target.result), {
          type: "array",
          cellDates: true,
        });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(firstSheet, {
          defval: "",
          raw: true,
        });

        if (!rawRows.length) {
          setSuccess(false);
          setMessage("Excel file is empty.");
          setLoading(false);
          return;
        }

        const { columns: validColumns, rows: validRows } =
          removeEmptyColumnsAndRows(rawRows);

        if (!validColumns.length || !validRows.length) {
          setSuccess(false);
          setMessage(
            "No valid data found. Empty column names and blank rows were removed.",
          );
          setLoading(false);
          return;
        }

        const autoMapping = {};
        validColumns.forEach((column) => {
          autoMapping[column] = findMatchField(column);
        });

        setColumns(validColumns);
        setExcelData(validRows);
        setMapping(autoMapping);
        setSuccess(true);
        setMessage(`Loaded ${validRows.length} valid rows.`);
      } catch (error) {
        console.error(error);
        setSuccess(false);
        setMessage("Unable to read the Excel file.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setSuccess(false);
      setMessage("Failed to read the file.");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const handleMappingChange = (excelColumn, assetField) => {
    setMapping((previous) => ({
      ...previous,
      [excelColumn]: assetField,
    }));
  };

  const finalAssets = useMemo(() => {
    return excelData.map((row, index) =>
      buildAssetFromRow(row, index, mapping),
    );
  }, [excelData, mapping]);

  const validateMappings = () => {
    const values = Object.values(mapping).filter(Boolean);

    if (!values.includes("assetCode")) {
      setSuccess(false);
      setMessage("Map one column to Asset Code before preview.");
      return false;
    }

    const seen = new Set();
    const duplicates = new Set();

    values.forEach((value) => {
      if (seen.has(value)) duplicates.add(value);
      seen.add(value);
    });

    if (duplicates.size > 0) {
      setSuccess(false);
      setMessage(
        "Each asset field should be mapped only once. Please fix duplicate mappings.",
      );
      return false;
    }

    setSuccess(true);
    setMessage("");
    return true;
  };

  const handleCreateAssets = async () => {
    if (!validateMappings()) return;

    setLoading(true);
    setMessage("Creating assets...");
    setSuccess(true);

    try {
      const results = await Promise.all(
        finalAssets.map((asset) =>
          fetch("http://localhost:3000/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(asset),
          }),
        ),
      );

      const allOk = results.every((response) => response.ok);
      if (!allOk) throw new Error("Some rows failed to save.");

      setSuccess(true);
      setMessage(`${finalAssets.length} assets created successfully.`);
      setPreviewMode(false);
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setMessage(
        "Import failed. Please make sure the JSON server is running on port 3000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setExcelData([]);
    setColumns([]);
    setMapping({});
    setFileName("");
    setMessage("");
    setSuccess(true);
    setPreviewMode(false);
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 ">
          <div className="mb-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            navigate("/assets", { replace: true });
                            window.location.reload();
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <ArrowLeft size={16} /> Back to Assets
                        </button>
                      </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Import Assets
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload Excel → clean empty columns → map fields → preview → create
              assets
            </p>
          </div>

          {excelData.length > 0 && (
            <button
              onClick={resetImport}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={16} />
                Upload Another
              </span>
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mb-5 p-4 rounded-lg border flex items-center gap-3 ${
              success
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {success ? (
              <FileSpreadsheet size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <p className="text-sm">{message}</p>
          </div>
        )}

        {excelData.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <FileSpreadsheet size={30} className="text-gray-600" />
              </div>

              <h2 className="text-xl font-semibold mt-5">Upload Excel File</h2>
              <p className="text-sm text-gray-500 mt-2">
                The system will remove empty column names and blank rows
                automatically.
              </p>

              <label className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition">
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Reading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Choose Excel File
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
        )}

        {excelData.length > 0 && (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <FileSpreadsheet size={21} className="text-green-600" />
                </div>

                <div>
                  <h2 className="font-medium text-gray-900">{fileName}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {excelData.length} valid rows • {columns.length} valid
                    columns
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Map Excel Columns
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Use the column name and alias match to decide which Excel
                  column fills each asset field.
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {columns.map((column) => (
                  <div
                    key={column}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center"
                  >
                    <div className="md:col-span-5">
                      <p className="font-medium text-gray-900">{column}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Example: {String(excelData[0]?.[column] ?? "")}
                      </p>
                    </div>

                    <div className="md:col-span-7">
                      <select
                        value={mapping[column] || ""}
                        onChange={(e) =>
                          handleMappingChange(column, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <option value="">-- Select Asset Field --</option>
                        {ASSET_FIELDS.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    if (validateMappings()) setPreviewMode(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  <Check size={18} />
                  Preview Assets
                </button>
              </div>
            </div>

            {previewMode && finalAssets.length > 0 && (
              <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      All Asset Data Before Creation
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      This is the final asset object list generated from Excel
                      rows.
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {finalAssets.length} assets
                  </span>
                </div>

                <div className="p-5 overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left border-b border-r">
                          #
                        </th>
                        <th className="px-4 py-3 text-left border-b border-r">
                          Asset Code
                        </th>
                        <th className="px-4 py-3 text-left border-b border-r">
                          Equipment
                        </th>
                        <th className="px-4 py-3 text-left border-b border-r">
                          Brand
                        </th>
                        <th className="px-4 py-3 text-left border-b border-r">
                          Model
                        </th>
                        <th className="px-4 py-3 text-left border-b border-r">
                          Department
                        </th>
                        <th className="px-4 py-3 text-left border-b border-r">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {finalAssets.map((asset, index) => (
                        <tr key={asset.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b border-r">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 border-b border-r">
                            {asset.assetCode}
                          </td>
                          <td className="px-4 py-3 border-b border-r">
                            {asset.equipment}
                          </td>
                          <td className="px-4 py-3 border-b border-r">
                            {asset.brand}
                          </td>
                          <td className="px-4 py-3 border-b border-r">
                            {asset.model}
                          </td>
                          <td className="px-4 py-3 border-b border-r">
                            {asset.department}
                          </td>
                          <td className="px-4 py-3 border-b border-r">
                            {asset.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-5 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Database size={18} className="text-gray-700" />
                    <h3 className="font-medium text-gray-900">JSON Preview</h3>
                  </div>

                  <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 text-xs overflow-auto max-h-[500px]">
                    {JSON.stringify(finalAssets.slice(0, 2), null, 2)}
                  </pre>
                </div>

                <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button
                    onClick={handleCreateAssets}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Database size={17} />
                        Create {finalAssets.length} Assets
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImportAssets;
