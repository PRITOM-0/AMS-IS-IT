import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { API_BASE_URL } from "../env";

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


// ==================================================
// 1. CLEAN COLUMN NAME
// ==================================================

const cleanColumn = (column) => {
  return String(column)
    .trim()
    .toLowerCase();
};


// ==================================================
// 2. GET EXCEL VALUE
// ==================================================

const getValue = (row, names) => {
  const keys = Object.keys(row);

  for (const name of names) {
    const foundKey = keys.find(
      (key) =>
        cleanColumn(key) === cleanColumn(name)
    );

    if (foundKey) {
      return row[foundKey] ?? "";
    }
  }

  return "";
};


// ==================================================
// 3. CONVERT DATE
// ==================================================

const convertDate = (value) => {
  if (!value) return "";

  // Excel date object
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Excel serial date
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);

    if (date) {
      const result = new Date(
        date.y,
        date.m - 1,
        date.d,
        date.H || 0,
        date.M || 0,
        date.S || 0
      );

      return result.toISOString();
    }
  }

  // Normal date string
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }

  return String(value);
};


// ==================================================
// 4. REMOVE EMPTY COLUMNS
// ==================================================

const removeEmptyColumns = (rows) => {
  if (!rows.length) return [];

  const columns = Object.keys(rows[0]);

  const validColumns = columns.filter((column) => {
    return rows.some(
      (row) =>
        row[column] !== null &&
        row[column] !== undefined &&
        String(row[column]).trim() !== ""
    );
  });

  return rows.map((row) => {
    const newRow = {};

    validColumns.forEach((column) => {
      newRow[column] = row[column];
    });

    return newRow;
  });
};


// ==================================================
// 5. REMOVE COMPLETELY EMPTY ROWS
// ==================================================

const removeEmptyRows = (rows) => {
  return rows.filter((row) => {
    return Object.values(row).some(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    );
  });
};


// ==================================================
// 6. CREATE ASSET FROM ONE EXCEL ROW
// ==================================================

const createAssetFromRow = (row, index) => {

  const asset = {
    ...demoAsset,

    id: `${Date.now()}-${index}`,

    equipment: getValue(row, [
      "Equipment",
    ]),

    assetCode: getValue(row, [
      "Asset Code",
      "AssetCode",
      "Asset ID",
    ]),

    brand: getValue(row, [
      "Brand",
      "Manufacturer",
    ]),

    model: getValue(row, [
      "Model",
      "Model Number",
      "Model No",
    ]),

    serialNumber: getValue(row, [
      "Serial Number",
      "Serial No",
      "Serial",
    ]),

    specifications: getValue(row, [
      "Configuration",
      "Specification",
      "Specifications",
    ]),

    macAddress: getValue(row, [
      "MAC Address",
      "MAC",
    ]),

    department: getValue(row, [
      "Department",
      "Dept",
    ]),

    location: getValue(row, [
      "Location",
      "Campus",
    ]),

    floor: getValue(row, [
      "Office",
      "Floor",
      "Building",
      "Room",
    ]),

    room: getValue(row, [
      "Room No",
      "Room",
      "Room Number",
    ]),

    status:
      getValue(row, [
        "Status",
        "Asset Status",
      ]) || "Instore",

    userId: "",

    userCode: getValue(row, [
      "Employee ID",
      "Employee Code",
      "User Code",
    ]),

    userName: getValue(row, [
      "User Name",
      "Employee Name",
      "Employee",
    ]),

    receivedDate: convertDate(
      getValue(row, [
        "User Received Date",
        "Received Date",
      ])
    ),

    purchaseDate: convertDate(
      getValue(row, [
        "Purchase Date",
      ])
    ),

    purchasePrice: getValue(row, [
      "Purchase Price",
      "Price",
      "Cost",
    ]),

    warrantyStart: "",

    warrantyEnd: convertDate(
      getValue(row, [
        "Warranty",
        "Warranty End",
      ])
    ),

    vendorName: getValue(row, [
      "Vendor Name",
      "Vendor",
      "Supplier",
    ]),

    remarks: getValue(row, [
      "Remarks",
      "Remark",
      "Comments",
    ]),

    surveyReport: getValue(row, [
      "IT Survey Report",
      "Survey Report",
    ]),

    createdAt: new Date().toISOString(),

    updatedAt: "",
  };

  // Old user information
  asset.oldUsers = {
    userId: "",

    userCode: getValue(row, [
      "Old User",
    ]),

    userName: "",

    receivedDate: "",

    returnedDate: "",

    issues: [],
  };

  return asset;
};


// ==================================================
// COMPONENT
// ==================================================

const ImportAssets = () => {

  const [excelRows, setExcelRows] = useState([]);

  const [assets, setAssets] = useState([]);

  const [fileName, setFileName] = useState("");

  const [showPreview, setShowPreview] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // ==================================================
  // UPLOAD EXCEL
  // ==================================================

  const handleUpload = (event) => {

    const file = event.target.files[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {

      const data = new Uint8Array(
        e.target.result
      );

      const workbook = XLSX.read(data, {
        type: "array",
        cellDates: true,
      });

      const sheetName =
        workbook.SheetNames[0];

      const sheet =
        workbook.Sheets[sheetName];

      let rows =
        XLSX.utils.sheet_to_json(sheet, {
          defval: "",
        });


      // 1. Remove empty rows
      rows = removeEmptyRows(rows);


      // 2. Remove empty columns
      rows = removeEmptyColumns(rows);


      setExcelRows(rows);

      // 3. Create asset objects
      const newAssets = rows.map(
        (row, index) =>
          createAssetFromRow(row, index)
      );

      setAssets(newAssets);

      setMessage(
        `${newAssets.length} assets prepared successfully.`
      );
    };

    reader.readAsArrayBuffer(file);

    event.target.value = "";
  };


  // ==================================================
  // CREATE ASSETS
  // ==================================================

  const createAssets = async () => {

    if (!assets.length) return;

    setCreating(true);
    setMessage("");

    try {

      await Promise.all(
        assets.map((asset) =>
          axios.post(
            `${API_BASE_URL}/assets`,
            asset
          )
        )
      );

      setMessage(
        `${assets.length} assets created successfully.`
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Error creating assets."
      );

    } finally {

      setCreating(false);
    }
  };


  // ==================================================
  // RESET
  // ==================================================

  const reset = () => {

    setExcelRows([]);

    setAssets([]);

    setFileName("");

    setShowPreview(false);

    setMessage("");
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-2">
        Import Assets
      </h1>

      <p className="text-gray-500 mb-6">
        Upload Excel file and create assets.
      </p>


      {/* ========================================= */}
      {/* UPLOAD */}
      {/* ========================================= */}

      <div className="border rounded-xl p-6 bg-white">

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleUpload}
        />

        {fileName && (
          <p className="mt-3 text-sm text-gray-600">
            File: {fileName}
          </p>
        )}

      </div>


      {/* ========================================= */}
      {/* MESSAGE */}
      {/* ========================================= */}

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          {message}
        </div>
      )}


      {/* ========================================= */}
      {/* EXCEL DATA */}
      {/* ========================================= */}

      {excelRows.length > 0 && (
        <div className="mt-6">

          <h2 className="text-lg font-semibold mb-3">
            Excel Data
          </h2>

          <div className="overflow-auto border rounded-xl bg-white max-h-[500px]">

            <table className="min-w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="px-4 py-3 border">
                    #
                  </th>

                  {Object.keys(
                    excelRows[0]
                  ).map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 border text-left"
                    >
                      {column}
                    </th>
                  ))}

                </tr>

              </thead>

              <tbody>

                {excelRows.map(
                  (row, index) => (
                    <tr key={index}>

                      <td className="px-4 py-3 border">
                        {index + 1}
                      </td>

                      {Object.keys(
                        excelRows[0]
                      ).map((column) => (
                        <td
                          key={column}
                          className="px-4 py-3 border whitespace-nowrap"
                        >
                          {String(
                            row[column] ?? ""
                          )}
                        </td>
                      ))}

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>


          {/* ===================================== */}
          {/* PREVIEW BUTTON */}
          {/* ===================================== */}

          <div className="flex gap-3 mt-5">

            <button
              onClick={() =>
                setShowPreview(true)
              }
              className="px-5 py-2 bg-gray-900 text-white rounded-lg"
            >
              Show Assets
            </button>

            <button
              onClick={reset}
              className="px-5 py-2 border rounded-lg"
            >
              Clear
            </button>

          </div>

        </div>
      )}


      {/* ========================================= */}
      {/* ASSET PREVIEW */}
      {/* ========================================= */}

      {showPreview && assets.length > 0 && (

        <div className="mt-8">

          <h2 className="text-lg font-semibold mb-3">
            Assets Ready to Create
          </h2>


          <div className="border rounded-xl bg-white overflow-auto max-h-[600px]">

            <pre className="p-5 text-sm">
              {JSON.stringify(
                assets,
                null,
                2
              )}
            </pre>

          </div>


          {/* CREATE */}
          <button
            onClick={createAssets}
            disabled={creating}
            className="mt-5 px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : `Create ${assets.length} Assets`}
          </button>

        </div>
      )}

    </div>
  );
};

export default ImportAssets;