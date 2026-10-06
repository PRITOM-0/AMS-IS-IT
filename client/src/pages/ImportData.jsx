import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
} from "lucide-react";

import { API_BASE_URL } from "../env";

const EXCEL_COLUMNS = [
  "employeeName",
  "employeeId",
  "designation",

  "vendorName",
  "contactPerson",
  "contact",
  "address",

  "company",
  "location",
  "department",
  "floor",
  "room",

  "equipment",
  "assetCode",
  "brand",
  "model",
  "serialNumber",
  "specifications",
  "macAddress",
  "ecfNumber",
  "workOrderNumber",
  "status",

  "oldEmployeeName",
  "oldEmployeeId",

  "receivedDate",
  "purchaseDate",
  "purchasePrice",
  "warrantyStart",
  "warrantyEnd",
  "warrantyYears",
  "remarks",
  "surveyStatus",
  "upgradeEquipments",
  "surveyTakenBy",
];

const PREVIEW_COLUMNS = [
  "employeeName",
  "vendorName",
  "company",
  "location",
  "department",
  "equipment",
  "assetCode",
  "brand",
  "status",
  "purchaseDate",
  "purchasePrice",
  "warrantyYears",
  "remarks",
  "surveyStatus",
];

export default function ImportData() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);

  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [result, setResult] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Read Excel
  |--------------------------------------------------------------------------
  */

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setRows([]);
    setError("");
    setSuccess("");
    setResult(null);

    setReading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        raw: false,
      });

      if (!workbook.SheetNames.length) {
        throw new Error("Excel file does not contain a worksheet.");
      }

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const excelRows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });
      console.log("Excel rows:", excelRows);

      if (!excelRows.length) {
        throw new Error("Excel file does not contain any data rows.");
      }

      /*
|--------------------------------------------------------------------------
| Check duplicate Excel headers
|--------------------------------------------------------------------------
*/

      const actualHeaders = XLSX.utils
        .sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          blankrows: false,
        })[0]
        .map((header) => String(header).trim());

      const duplicateHeaders = actualHeaders.filter(
        (header, index) => header && actualHeaders.indexOf(header) !== index,
      );

      if (duplicateHeaders.length > 0) {
        throw new Error(
          `Duplicate Excel column found: ${[...new Set(duplicateHeaders)].join(
            ", ",
          )}`,
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Normalize all values
      |--------------------------------------------------------------------------
      */

      const normalizedRows = excelRows.map((row) => {
        const normalized = {};
        console.log("Normalized row:", row);

        for (const column of EXCEL_COLUMNS) {
          const cell = row[column];

          normalized[column] =
            cell === undefined || cell === null ? "" : String(cell).trim();
        }

        return normalized;
      });

      setRows(normalizedRows);

      setSuccess(
        `${normalizedRows.length} row${
          normalizedRows.length === 1 ? "" : "s"
        } loaded successfully.`,
      );
    } catch (err) {
      console.error("[ImportData] Excel read failed", {
        fileName: selectedFile.name,
        message: err.message,
      });

      setError(err.message || "Failed to read Excel file.");
    } finally {
      setReading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Import
  |--------------------------------------------------------------------------
  */

  const handleImport = async () => {
    if (!rows.length) {
      setError("Please select and load an Excel file first.");

      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");
    setResult(null);

    const endpoint = `${API_BASE_URL}/import/assets-employees-vendors`;

    try {
      const response = await axios.post(
        endpoint,
        {
          rows,
        },
        {
          withCredentials: true,

          headers: {
            "Content-Type": "application/json",
          },

          timeout: 15 * 60 * 1000,
        },
      );

      const data = response.data;

      setResult(data);

      setSuccess(data.message || "Import completed successfully.");
    } catch (err) {
      console.error("[ImportData] Import request failed", {
        endpoint,
        status: err.response?.status,
        code: err.code,
        message: err.message,
      });

      setResult(err.response?.data || null);

      setError(err.response?.data?.message || err.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Clear
  |--------------------------------------------------------------------------
  */

  const handleClear = () => {
    setFile(null);
    setRows([]);
    setError("");
    setSuccess("");
    setResult(null);

    const input = document.getElementById("excel-file");

    if (input) {
      input.value = "";
    }
  };

  return (
    <div className="w-full min-h-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Import Data</h1>

          <p className="text-sm text-gray-500 mt-1">
            Import employees, vendors and assets from Excel.
          </p>
          <div className="flex flex-wrap gap-2">
            {EXCEL_COLUMNS.map((column) => (
              <div
                key={column}
                className="shrink-0 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm font-medium"
              >
                {column}
              </div>
            ))}
          </div>
        </div>

        {/* Upload */}

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <label
            htmlFor="excel-file"
            className="
              min-h-[220px]
              flex flex-col
              items-center
              justify-center
              border-2
              border-dashed
              border-gray-300
              rounded-xl
              cursor-pointer
              hover:border-gray-500
              transition
            "
          >
            <FileSpreadsheet size={48} className="text-gray-500 mb-4" />

            <span className="text-sm font-medium text-gray-800">
              {file ? file.name : "Choose Excel file"}
            </span>

            <span className="text-xs text-gray-500 mt-2">XLSX / XLS</span>

            <input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Reading */}

          {reading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Loader2 size={18} className="animate-spin" />
              Reading Excel file...
            </div>
          )}

          {/* Success */}

          {success && (
            <div
              className="
                mt-4
                flex
                items-start
                gap-2
                rounded-lg
                border
                border-green-200
                bg-green-50
                p-4
                text-sm
                text-green-700
              "
            >
              <CheckCircle size={18} className="mt-0.5 shrink-0" />

              <span>{success}</span>
            </div>
          )}

          {/* Error */}

          {error && (
            <div
              className="
                mt-4
                flex
                items-start
                gap-2
                rounded-lg
                border
                border-red-200
                bg-red-50
                p-4
                text-sm
                text-red-700
              "
            >
              <XCircle size={18} className="mt-0.5 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* Result */}

          {result && (
            <div className="mt-6">
              <ImportResult result={result} />
            </div>
          )}

          {/* Preview */}

          {rows.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Import Preview
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    {rows.length} rows ready for import
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={importing}
                    className="
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      border
                      border-gray-300
                      rounded-lg
                      text-sm
                      text-gray-700
                      hover:bg-gray-50
                      disabled:opacity-50
                    "
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={importing || reading || rows.length === 0}
                    className="
                      flex
                      items-center
                      gap-2
                      px-5
                      py-2
                      rounded-lg
                      bg-black
                      text-white
                      text-sm
                      font-medium
                      hover:bg-gray-800
                      disabled:opacity-50
                    "
                  >
                    {importing ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload size={17} />
                        Import All
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}

              <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
                Import is atomic: if any row fails, the complete import is
                rolled back.
              </div>

              {/* Preview table */}

              <div className="border border-gray-200 rounded-lg overflow-auto">
                <table className="min-w-max w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>

                      {PREVIEW_COLUMNS.map((column) => (
                        <th
                          key={column}
                          className="
                              px-4
                              py-3
                              text-left
                              whitespace-nowrap
                              font-medium
                              text-gray-700
                            "
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="px-4 py-3">{index + 1}</td>

                        {PREVIEW_COLUMNS.map((column) => (
                          <td
                            key={column}
                            className="
                                    px-4
                                    py-3
                                    whitespace-nowrap
                                    text-gray-700
                                  "
                          >
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 20 && (
                <p className="mt-2 text-xs text-gray-500">
                  Showing first 20 rows. All {rows.length} rows will be
                  imported.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Import Result
|--------------------------------------------------------------------------
*/

function ImportResult({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <ResultCard label="Total Rows" value={result.totalRows} />

      <ResultCard label="Assets Created" value={result.assetsCreated} />

      <ResultCard label="Employees Created" value={result.employeesCreated} />

      <ResultCard label="Existing Employees" value={result.employeesExisting} />

      <ResultCard label="Vendors Created" value={result.vendorsCreated} />

      <ResultCard label="Existing Vendors" value={result.vendorsExisting} />
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="border border-gray-200 bg-white rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>

      <p className="mt-1 text-xl font-semibold text-gray-900">{value ?? 0}</p>
    </div>
  );
}
