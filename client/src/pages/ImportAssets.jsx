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

/* =========================================================
   ASSET DATA STRUCTURE
========================================================= */

const demoAsset = {
  equipment: "",
  assetCode: "",
  brand: "",
  model: "",
  serialNumber: "",
  specifications: "",
  macAddress: "",

  company: "",
  location: "",
  department: "",
  floor: "",
  room: "",

  status: "",

  employeeId: "",
  receivedDate: "",
  oldUsers: [],

  purchaseDate: "",
  purchasePrice: "",

  warrantyStart: "",
  warrantyEnd: "",
  warrantyYears: "",

  vendorId: "",

  remarks: "",
  surveyStatus: "",
  upgradeEquipments: "",

  surveyTakenBy: "",

  createdAt: "",
  updatedAt: "",

  id: ""
};

/* =========================================================
   FINAL EXCEL FIELDS
   Excel column names MUST match these fields.
========================================================= */

const ASSET_FIELDS = [
  "equipment",
  "assetCode",
  "brand",
  "model",
  "serialNumber",
  "specifications",
  "macAddress",
  "company",
  "location",
  "department",
  "floor",
  "room",
  "status",
  "employeeId",
  "receivedDate",
  "purchaseDate",
  "purchasePrice",
  "warrantyStart",
  "warrantyEnd",
  "warrantyYears",
  "vendorId",
  "remarks",
  "surveyStatus",
  "upgradeEquipments",
  "surveyTakenBy",
];

/* =========================================================
   REQUIRED EXCEL FIELDS
========================================================= */

const REQUIRED_FIELDS = [
  "equipment",
  "assetCode",
  "brand",
  "company",
  "location",
  "status",
  "purchaseDate",
];

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDateTime = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "";
  }

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

  const parsedDate = new Date(String(value).trim());

  return !Number.isNaN(parsedDate.getTime())
    ? parsedDate.toISOString()
    : String(value).trim();
};

/* =========================================================
   VALUE CONVERSION
========================================================= */

const convertCellValue = (value, fieldName) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "";
  }

  const dateFields = [
    "purchaseDate",
    "receivedDate",
    "warrantyStart",
    "warrantyEnd",
  ];

  if (dateFields.includes(fieldName)) {
    return formatDateTime(value);
  }

  if (
    fieldName === "purchasePrice" ||
    fieldName === "warrantyYears"
  ) {
    const numberValue = String(value).trim();

    return /^[0-9.]*$/.test(numberValue)
      ? numberValue
      : "";
  }

  return String(value).trim();
};

/* =========================================================
   VALIDATE EXCEL COLUMNS
========================================================= */

const validateColumns = (columns) => {
  const errors = [];

  const normalizedColumns = columns.map((column) =>
    String(column).trim()
  );

  /* Check required fields */
  REQUIRED_FIELDS.forEach((field) => {
    if (!normalizedColumns.includes(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  /* Check for unknown fields */
  normalizedColumns.forEach((column) => {
    if (!ASSET_FIELDS.includes(column)) {
      errors.push(`Unknown Excel field: ${column}`);
    }
  });

  return errors;
};

/* =========================================================
   CLEAN EXCEL DATA
========================================================= */

const removeEmptyColumnsAndRows = (rows) => {
  if (!rows.length) {
    return {
      columns: [],
      rows: [],
    };
  }

  /* Only keep columns that belong to the final schema */
  const validColumns = Object.keys(rows[0]).filter((column) =>
    ASSET_FIELDS.includes(String(column).trim())
  );

  const cleanedRows = rows
    .map((row) => {
      const newRow = {};

      validColumns.forEach((column) => {
        newRow[column] = row[column];
      });

      return newRow;
    })
    .filter((row) => {
      const isNotEmpty = Object.values(row).some(
        (value) =>
          String(value ?? "").trim() !== ""
      );

      const hasEquipment =
        String(row.equipment ?? "").trim() !== "";

      return isNotEmpty && hasEquipment;
    });

  return {
    columns: validColumns,
    rows: cleanedRows,
  };
};

/* =========================================================
   BUILD ASSET FROM EXCEL ROW
========================================================= */

const buildAssetFromRow = (row, rowIndex) => {
  const now = new Date().toISOString();

  const asset = {
    ...demoAsset,

    id: `${Date.now()}-${rowIndex}`,

    createdAt: now,
    updatedAt: now,

    employeeId: "",
    receivedDate: "",
    oldUsers: [],
  };

  /* -------------------------------------------------------
     Direct field-to-field assignment
     No mapping / alias matching required.
  ------------------------------------------------------- */

  ASSET_FIELDS.forEach((fieldName) => {
    if (!(fieldName in row)) {
      return;
    }

    const value = convertCellValue(
      row[fieldName],
      fieldName
    );

    if (!value) {
      return;
    }

    if (fieldName === "oldUsers") {
      asset.oldUsers = [value];
      return;
    }

    asset[fieldName] = value;
  });

  /* -------------------------------------------------------
     WARRANTY
  ------------------------------------------------------- */

  if (
    asset.purchaseDate &&
    !asset.warrantyStart
  ) {
    asset.warrantyStart = asset.purchaseDate;
  }

  if (
    asset.purchaseDate &&
    asset.warrantyYears
  ) {
    const startDate = new Date(asset.purchaseDate);

    const years = parseInt(
      asset.warrantyYears,
      10
    );

    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(years)
    ) {
      const endDate = new Date(startDate);

      endDate.setFullYear(
        endDate.getFullYear() + years
      );

      asset.warrantyEnd =
        endDate.toISOString().split("T")[0];
    }
  }

  return asset;
};

/* =========================================================
   COMPONENT
========================================================= */

const ImportAssets = () => {
  const navigate = useNavigate();

  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);
  const [loading, setLoading] = useState(false);

  /* =======================================================
     FILE UPLOAD
  ======================================================= */

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
        const workbook = XLSX.read(
          new Uint8Array(loadEvent.target.result),
          {
            type: "array",
            cellDates: true,
          }
        );

        const firstSheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        const rawRows =
          XLSX.utils.sheet_to_json(
            firstSheet,
            {
              defval: "",
              raw: true,
            }
          );

        if (!rawRows.length) {
          setSuccess(false);
          setMessage("Excel file is empty.");
          setLoading(false);
          return;
        }

        /* =================================================
           EXACT FIELD VALIDATION
        ================================================= */

        const excelColumns = Object.keys(
          rawRows[0]
        );

        const columnErrors =
          validateColumns(excelColumns);

        if (columnErrors.length > 0) {
          setSuccess(false);

          setMessage(
            `Invalid Excel structure:\n${columnErrors.join(
              "\n"
            )}`
          );

          setLoading(false);
          return;
        }

        /* =================================================
           CLEAN DATA
        ================================================= */

        const {
          columns: validColumns,
          rows: validRows,
        } = removeEmptyColumnsAndRows(rawRows);

        if (
          !validColumns.length ||
          !validRows.length
        ) {
          setSuccess(false);

          setMessage(
            "No valid data found. Rows without Equipment were removed."
          );

          setLoading(false);
          return;
        }

        /* =================================================
           BUILD FINAL ASSETS DIRECTLY
        ================================================= */

        const finalAssets = validRows
          .map((row, index) =>
            buildAssetFromRow(row, index)
          )
          .filter(
            (asset) =>
              String(
                asset.equipment || ""
              ).trim() !== ""
          );

        if (!finalAssets.length) {
          setSuccess(false);

          setMessage(
            "No valid asset records found."
          );

          setLoading(false);
          return;
        }

        setColumns(validColumns);
        setExcelData(finalAssets);

        setSuccess(true);

        setMessage(
          `Successfully loaded ${finalAssets.length} asset records from ${file.name}.`
        );
      } catch (error) {
        console.error(
          "Excel import error:",
          error
        );

        setSuccess(false);
        setMessage(
          "Unable to read the Excel file."
        );
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);

    event.target.value = "";
  };

  /* =======================================================
     PROCEED
  ======================================================= */

  const proceedToStore = () => {
    if (!excelData.length) {
      setSuccess(false);
      setMessage(
        "No valid asset data available."
      );
      return;
    }

    navigate("/assets/store", {
      state: {
        assets: excelData,
        fileName,
      },
    });
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetImport = () => {
    setExcelData([]);
    setColumns([]);
    setFileName("");
    setMessage("");
    setSuccess(true);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen rounded-2xl border border-indigo-400 shadow-2xl bg-white p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate("/assets", {
                  replace: true,
                })
              }
              className="mb-3 inline-flex items-center gap-2 rounded-xl border border-indigo-400 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 hover:text-indigo-600 transition-all duration-150 active:scale-[0.98]"
            >
              <ArrowLeft
                size={15}
                className="text-indigo-600"
              />

              Back to Assets
            </button>

            {/* =================================================
                EXCEL FIELDS
            ================================================= */}

            {columns.length === 0 && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm">

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-sm">
                    <FileSpreadsheet className="h-4 w-4 text-white" />
                  </div>

                  <span className="text-sm font-bold text-slate-800">
                    Excel Fields
                  </span>

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    25 Fields
                  </span>

                </div>

                <div className="flex flex-wrap gap-2">

                  {ASSET_FIELDS.map(
                    (field, index) => (
                      <span
                        key={field}
                        className="
                          group inline-flex items-center gap-1.5
                          rounded-lg border border-slate-200
                          bg-gradient-to-b from-white to-slate-50
                          px-2.5 py-1.5
                          text-[11px] font-medium text-slate-600
                          shadow-sm
                          transition-all duration-200
                          hover:-translate-y-0.5
                          hover:border-red-200
                          hover:bg-red-50
                          hover:text-red-600
                          hover:shadow-md
                        "
                      >

                        <span
                          className="
                            flex h-4 w-4 items-center justify-center
                            rounded-md bg-slate-100
                            text-[9px] font-bold text-slate-400
                            transition-colors
                            group-hover:bg-red-100
                            group-hover:text-red-500
                          "
                        >
                          {index + 1}
                        </span>

                        {field}

                      </span>
                    )
                  )}

                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">

                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[10px] text-slate-400">
                    Excel column names must exactly match
                    these fields.
                  </span>

                </div>

              </div>
            )}

            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <FileSpreadsheet size={20} />
              </div>

              <div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Import Assets
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Upload Excel
                  <span className="text-indigo-400 mx-1">
                    •
                  </span>
                  Validate
                  <span className="text-indigo-400 mx-1">
                    •
                  </span>
                  Clean Data
                  <span className="text-indigo-400 mx-1">
                    •
                  </span>
                  Review
                  <span className="text-indigo-400 mx-1">
                    •
                  </span>
                  Store to DB
                </p>

              </div>

            </div>

          </div>

          {excelData.length > 0 && (
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-indigo-400 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all active:scale-[0.98]"
            >
              <RefreshCw
                size={15}
                className="text-indigo-600"
              />

              Upload Another File
            </button>
          )}

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`p-4 rounded-xl border flex items-start sm:items-center gap-3 shadow-sm whitespace-pre-line ${
              success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >

            {success ? (
              <Check
                size={18}
                className="text-emerald-600 shrink-0"
              />
            ) : (
              <AlertCircle
                size={18}
                className="text-rose-600 shrink-0"
              />
            )}

            <p className="text-xs sm:text-sm font-medium">
              {message}
            </p>

          </div>
        )}

        {/* =================================================
            UPLOAD
        ================================================= */}

        {excelData.length === 0 ? (

          <div className="bg-white border border-indigo-400 rounded-2xl p-8 sm:p-14 shadow-sm relative overflow-hidden">

            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="max-w-md mx-auto text-center">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 border border-indigo-500 flex items-center justify-center text-indigo-600 shadow-inner mb-5">
                <Upload size={32} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Upload Excel Spreadsheet
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Supports{" "}
                <span className="font-semibold text-indigo-600">
                  .xlsx
                </span>
                ,{" "}
                <span className="font-semibold text-indigo-600">
                  .xls
                </span>
                , or{" "}
                <span className="font-semibold text-indigo-600">
                  .csv
                </span>
                .
                <br />
                Excel columns must use the exact
                asset field names.
              </p>

              <label className="mt-7 inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-500/25 active:scale-[0.98] transition-all">

                {loading ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />

                    Reading File...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={17} />

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

        ) : (

          /* =================================================
             REVIEW
          ================================================= */

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/30">

              <div className="flex items-center gap-3">

                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xs">
                  <Check size={16} />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Excel Data Ready
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    All fields validated and converted
                    successfully.
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 flex-wrap">

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-sm">

                  File:

                  <strong className="ml-1 text-indigo-600 font-semibold">
                    {fileName}
                  </strong>

                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {excelData.length} Rows
                </span>

              </div>

            </div>

            {/* =================================================
                DATA PREVIEW
            ================================================= */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-xs sm:text-sm text-left border-collapse">

                <thead>

                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">

                    <th className="px-4 py-3 text-center w-12 border-r border-slate-200">
                      #
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Equipment
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Asset Code
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Brand
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Model
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Company
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Location
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Department
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Status
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Employee ID
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Purchase Date
                    </th>

                    <th className="px-4 py-3 border-r border-slate-200">
                      Purchase Price
                    </th>

                    <th className="px-4 py-3">
                      Vendor ID
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">

                  {excelData.map(
                    (asset, index) => (

                      <tr
                        key={asset.id || index}
                        className="hover:bg-indigo-50/30 transition-colors"
                      >

                        <td className="px-4 py-3 text-center text-slate-400 font-medium border-r border-slate-100">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-100">
                          {asset.equipment || "-"}
                        </td>

                        <td className="px-4 py-3 font-mono text-indigo-600 font-semibold border-r border-slate-100">
                          {asset.assetCode || "-"}
                        </td>

                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.brand || "-"}
                        </td>

                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.model || "-"}
                        </td>

                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.company || "-"}
                        </td>

                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.location || "-"}
                        </td>

                        <td className="px-4 py-3 border-r border-slate-100">
                          {asset.department || "-"}
                        </td>

                        <td className="px-4 py-3 border-r border-slate-100">

                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {asset.status || "N/A"}
                          </span>

                        </td>

                        <td className="px-4 py-3 font-mono border-r border-slate-100">
                          {asset.employeeId || "-"}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap border-r border-slate-100">
                          {asset.purchaseDate || "-"}
                        </td>

                        <td className="px-4 py-3 font-semibold border-r border-slate-100">
                          {asset.purchasePrice || "-"}
                        </td>

                        <td className="px-4 py-3 font-mono text-violet-600 font-semibold">
                          {asset.vendorId || "-"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                PROCEED
            ================================================= */}

            <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">

              <div className="text-xs text-slate-500">
                <span className="font-semibold text-emerald-600">
                  {excelData.length}
                </span>{" "}
                valid asset records are ready to store.
              </div>

              <button
                onClick={proceedToStore}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
              >
                <Check size={16} />

                Proceed to Review & Save
              </button>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ImportAssets;