import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import Vendor from "../models/Vendor.js";

const MAX_ROWS = 5000;

/* =========================================================
   CLEAN VALUE
========================================================= */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

/* =========================================================
   EMPLOYEE FIELDS

   These are the fields used to find/create Employee.

   Blank Excel fields are ignored during matching.
========================================================= */

const employeeFields = [
  "employeeName",
  "employeeId",
  "company",
  "location",
  "floor",
  "room",
];

/* =========================================================
   VENDOR FIELDS

   Blank Excel fields are ignored during matching.
========================================================= */

const vendorFields = [
  "vendorName",
  "contactPerson",
  "contact",
  "address",
];

/* =========================================================
   ASSET FIELDS

   These fields come directly from Excel.
========================================================= */

const assetFields = [
  "equipment",
  "assetCode",
  "company",
  "location",
  "department",
  "floor",
  "room",
  "brand",
  "model",
  "serialNumber",
  "specifications",
  "macAddress",
  "ecfNumber",
  "workOrderNumber",
  "status",
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

/* =========================================================
   GET DATA

   Gets only requested fields from Excel.
========================================================= */

const getData = (row, fields) => {
  const data = {};

  for (const field of fields) {
    data[field] = clean(row[field]);
  }

  return data;
};

/* =========================================================
   BUILD MATCH QUERY

   Only non-empty Excel fields are included.

   Example:

   Excel:
   employeeName = Rahim
   employeeId   = EMP-1001
   company      = AHL
   location     = ""
   floor        = 5

   Query:

   {
     employeeName: "Rahim",
     employeeId: "EMP-1001",
     company: "AHL",
     floor: "5"
   }

   MongoDB must match ALL of these fields.
========================================================= */

const getMatchQuery = (row, fields) => {
  const query = {};

  for (const field of fields) {
    const value = clean(row[field]);

    if (value !== "") {
      query[field] = value;
    }
  }

  if (Object.keys(query).length === 0) {
    return null;
  }

  return query;
};

/* =========================================================
   IMPORT CONTROLLER
========================================================= */

export const importAssetsEmployeesVendors = async (
  req,
  res
) => {
  const rows = req.body?.rows;

  console.log(
    "[Import] Started:",
    Array.isArray(rows) ? rows.length : 0,
    "rows"
  );

  /* =======================================================
     VALIDATE EXCEL DATA
  ======================================================= */

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No Excel data found.",
    });
  }

  if (rows.length > MAX_ROWS) {
    return res.status(400).json({
      success: false,
      message: `Maximum ${MAX_ROWS} rows allowed.`,
    });
  }

  /* =======================================================
     COUNTERS
  ======================================================= */

  let employeesCreated = 0;
  let employeesExisting = 0;

  let vendorsCreated = 0;
  let vendorsExisting = 0;

  let assetsCreated = 0;
  let assetsExisting = 0;

  /* =======================================================
     CACHE

     Important when many Excel rows contain the same
     employee/vendor.
  ======================================================= */

  const employeeCache = new Map();
  const vendorCache = new Map();

  try {
    /* =====================================================
       PROCESS EACH ROW
    ===================================================== */

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Excel header = row 1
      // First data row = row 2
      const excelRow = i + 2;

      console.log(
        `[Import] Processing Excel row ${excelRow}`
      );

      /* ===================================================
         1. EMPLOYEE
      =================================================== */

      const employeeQuery = getMatchQuery(
        row,
        employeeFields
      );

      let employee = null;

      /*
       * Employee data exists in this row.
       */
      if (employeeQuery) {
        const employeeKey =
          JSON.stringify(employeeQuery);

        /* -------------------------------------------------
           CHECK CACHE
        ------------------------------------------------- */

        if (employeeCache.has(employeeKey)) {
          employee =
            employeeCache.get(employeeKey);

          console.log(
            `[Import] Employee from cache: ${employee.employeeId}`
          );
        } else {
          /* -----------------------------------------------
             FIND EXISTING EMPLOYEE
          ------------------------------------------------ */

          employee =
            await Employee.findOne(
              employeeQuery
            );

          if (employee) {
            employeesExisting++;

            console.log(
              `[Import] Existing employee: ${employee.employeeId} / ${employee._id}`
            );
          } else {
            /* ---------------------------------------------
               CREATE NEW EMPLOYEE
            ------------------------------------------------ */

            const employeeData =
              getData(
                row,
                employeeFields
              );

            /*
             * Employee model requires these two fields.
             */
            if (!employeeData.employeeName) {
              throw new Error(
                `Excel row ${excelRow}: employeeName is required for a new employee.`
              );
            }

            if (!employeeData.employeeId) {
              throw new Error(
                `Excel row ${excelRow}: employeeId is required for a new employee.`
              );
            }

            employee =
              await Employee.create({
                employeeName:
                  employeeData.employeeName,

                employeeId:
                  employeeData.employeeId,

                company:
                  employeeData.company,

                location:
                  employeeData.location,

                floor:
                  employeeData.floor,

                room:
                  employeeData.room,

                assetlist: [],
              });

            employeesCreated++;

            console.log(
              `[Import] Employee created: ${employee.employeeId} / ${employee._id}`
            );
          }

          /* ---------------------------------------------
             SAVE IN CACHE
          ------------------------------------------------ */

          employeeCache.set(
            employeeKey,
            employee
          );
        }
      }

      /* ===================================================
         2. VENDOR
      =================================================== */

      const vendorQuery = getMatchQuery(
        row,
        vendorFields
      );

      let vendor = null;

      /*
       * Vendor data exists.
       */
      if (vendorQuery) {
        const vendorKey =
          JSON.stringify(vendorQuery);

        /* -------------------------------------------------
           CHECK CACHE
        ------------------------------------------------ */

        if (vendorCache.has(vendorKey)) {
          vendor =
            vendorCache.get(vendorKey);

          console.log(
            `[Import] Vendor from cache: ${vendor.vendorName}`
          );
        } else {
          /* -----------------------------------------------
             FIND EXISTING VENDOR
          ------------------------------------------------ */

          vendor =
            await Vendor.findOne(
              vendorQuery
            );

          if (vendor) {
            vendorsExisting++;

            console.log(
              `[Import] Existing vendor: ${vendor.vendorName} / ${vendor._id}`
            );
          } else {
            /* ---------------------------------------------
               CREATE NEW VENDOR
            ------------------------------------------------ */

            vendor =
              await Vendor.create({
                vendorName:
                  clean(row.vendorName),

                contactPerson:
                  clean(row.contactPerson),

                contact:
                  clean(row.contact),

                address:
                  clean(row.address),
              });

            vendorsCreated++;

            console.log(
              `[Import] Vendor created: ${vendor.vendorName} / ${vendor._id}`
            );
          }

          /* ---------------------------------------------
             SAVE IN CACHE
          ------------------------------------------------ */

          vendorCache.set(
            vendorKey,
            vendor
          );
        }
      }

      /* ===================================================
         3. ASSET DATA
      =================================================== */

      const assetData =
        getData(
          row,
          assetFields
        );

      /* ===================================================
         4. EMPLOYEE REFERENCE

         Store MongoDB Employee._id in Asset.employeeId
      =================================================== */

      assetData.employeeId =
        employee
          ? employee._id
          : null;

      /* ===================================================
         5. VENDOR REFERENCE

         Store MongoDB Vendor._id in Asset.vendorId
      =================================================== */

      assetData.vendorId =
        vendor
          ? vendor._id
          : null;

      /* ===================================================
         6. OLD EMPLOYEE

         Excel:
         old-employeeName
         old-assetemployeeId

         Asset:
         oldUsers: [
           {
             employeeName,
             employeeId
           }
         ]
      =================================================== */

      const oldEmployeeName =
        clean(
          row["old-employeeName"]
        );

      const oldEmployeeId =
        clean(
          row["old-assetemployeeId"]
        );

      if (
        oldEmployeeName ||
        oldEmployeeId
      ) {
        assetData.oldUsers = [
          {
            employeeName:
              oldEmployeeName,

            employeeId:
              oldEmployeeId,
          },
        ];
      } else {
        assetData.oldUsers = [];
      }

      /* ===================================================
         7. ASSET CODE VALIDATION
      =================================================== */

      if (!assetData.assetCode) {
        throw new Error(
          `Excel row ${excelRow}: assetCode is required.`
        );
      }

      /* ===================================================
         8. FIND EXISTING ASSET

         assetCode is used as unique identifier.
      =================================================== */

      let asset =
        await Asset.findOne({
          assetCode:
            assetData.assetCode,
        });

      if (asset) {
        /* -------------------------------------------------
           EXISTING ASSET

           Do NOT create duplicate.

           But make sure its employee/vendor references
           are correct.
        ------------------------------------------------ */

        let assetChanged = false;

        /* -----------------------------------------------
           Employee reference
        ------------------------------------------------ */

        if (
          employee &&
          String(
            asset.employeeId || ""
          ) !==
            String(
              employee._id
            )
        ) {
          asset.employeeId =
            employee._id;

          assetChanged = true;
        }

        /* -----------------------------------------------
           Vendor reference
        ------------------------------------------------ */

        if (
          vendor &&
          String(
            asset.vendorId || ""
          ) !==
            String(
              vendor._id
            )
        ) {
          asset.vendorId =
            vendor._id;

          assetChanged = true;
        }

        /* -----------------------------------------------
           Save relationship changes
        ------------------------------------------------ */

        if (assetChanged) {
          asset.updatedAt =
            new Date().toISOString();

          await asset.save();

          console.log(
            `[Import] Existing asset relationships updated: ${asset.assetCode}`
          );
        } else {
          console.log(
            `[Import] Existing asset: ${asset.assetCode}`
          );
        }

        assetsExisting++;
      } else {
        /* -------------------------------------------------
           CREATE NEW ASSET
        ------------------------------------------------ */

        asset =
          await Asset.create(
            assetData
          );

        assetsCreated++;

        console.log(
          `[Import] Asset created: ${asset.assetCode} / ${asset._id}`
        );
      }

      /* ===================================================
         9. LINK ASSET TO EMPLOYEE

         Employee.assetlist is [String].

         Therefore:
         Asset._id → String → Employee.assetlist
      =================================================== */

      if (employee) {
        const assetId =
          asset._id.toString();

        /*
         * Make sure assetlist exists.
         */
        if (
          !Array.isArray(
            employee.assetlist
          )
        ) {
          employee.assetlist = [];
        }

        /*
         * Do not add duplicate Asset ID.
         */
        if (
          !employee.assetlist.includes(
            assetId
          )
        ) {
          employee.assetlist.push(
            assetId
          );

          employee.updatedAt =
            new Date().toISOString();

          await employee.save();

          console.log(
            `[Import] Asset linked: ${employee.employeeId} ← ${asset.assetCode}`
          );
        } else {
          console.log(
            `[Import] Asset already linked: ${employee.employeeId} ← ${asset.assetCode}`
          );
        }
      }

      /* ===================================================
         ROW COMPLETE
      =================================================== */

      console.log(
        `[Import] Excel row ${excelRow} completed.`
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "[Import] Completed successfully."
    );

    return res.status(201).json({
      success: true,

      message:
        "Import completed successfully.",

      totalRows:
        rows.length,

      employeesCreated,
      employeesExisting,

      vendorsCreated,
      vendorsExisting,

      assetsCreated,
      assetsExisting,
    });
  } catch (error) {
    /* =====================================================
       ERROR
    ===================================================== */

    console.error(
      "[Import] Failed:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Import failed.",

      error:
        error.message,

      note:
        "Rows already saved before the error were not automatically removed.",

      processed: {
        employeesCreated,
        employeesExisting,

        vendorsCreated,
        vendorsExisting,

        assetsCreated,
        assetsExisting,
      },
    });
  }
};