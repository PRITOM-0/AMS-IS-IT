import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import Vendor from "../models/Vendor.js";

const MAX_ROWS = 5000;

export const importAssetsEmployeesVendors = async (req, res) => {
  const rows = req.body?.rows;

  if (!Array.isArray(rows) || !rows.length) {
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

  let employeesCreated = 0;
  let employeesExisting = 0;
  let vendorsCreated = 0;
  let vendorsExisting = 0;
  let assetsCreated = 0;

  

  try {
    for (let i = 0; i < rows.length; i++) {
      const store = {
        employeeId:null,
        vendorId: null,
      };
      const row = rows[i];

      //Employee Handling
      if (row["employeeName"] != "") {
        const oldEmployee = await Employee.findOne({
          employeeId: row["employeeId"] || "",
          employeeName: row["employeeName"] || "",
          company: row["company"] || "",
          location: row["location"] || "",
          department: row["department"] || "",
          floor: row["floor"] || "",
          room: row["room"] || "",
        });

        if (!oldEmployee) {
          const newEmployeeData = {
            employeeId: row["employeeId"] || "",
            employeeName: row["employeeName"] || "",
            assetlist: [],
            designation: row["designation"] || "",
            company: row["company"] || "",
            location: row["location"] || "",
            department: row["department"] || "",
            floor: row["floor"] || "",
            room: row["room"] || "",
          };

          const createdEmployee = await Employee.create(newEmployeeData);
          store.employeeId = createdEmployee._id;
          employeesCreated++;
        } else {
          store.employeeId = oldEmployee._id;
          employeesExisting++;
        }
      }

      //Vendor Handling

      if (row["vendorName"] != "") {
        const oldVendor = await Vendor.findOne({
          vendorName: row["vendorName"] || "",
          contactPerson: row["contactPerson"] || "",
        });

        if (!oldVendor) {
          const newVendorData = {
            vendorName: row["vendorName"] || "",
            contactPerson: row["contactPerson"] || "",
            contact: row["contact"] || "",
            address: row["address"] || "",
          };

          const createdVendor = await Vendor.create(newVendorData);
          store.vendorId = createdVendor._id;
          vendorsCreated++;
        } else {
          store.vendorId = oldVendor._id;
          vendorsExisting++;
        }
      }

      //Asset Handling

      const newAssetData = {
        assetCode: row["assetCode"] || "",
        equipment: row["equipment"] || "",
        company: row["company"] || "",
        location: row["location"] || "",
        department: row["department"] || "",
        floor: row["floor"] || "",
        room: row["room"] || "",
        brand: row["brand"] || "",
        model: row["model"] || "",
        serialNumber: row["serialNumber"] || "",
        specifications: row["specifications"] || "",
        macAddress: row["macAddress"] || "",
        ecfNumber: row["ecfNumber"] || "",
        workOrderNumber: row["workOrderNumber"] || "",
        status: row["status"] || "",
        oldUser: [
          {
            employeeId: row["oldEmployeeId"] || "",
            employeeName: row["oldEmployeeName"] || "",
          },
        ],
        receivedDate: row["receivedDate"] || "",
        purchaseDate: row["purchaseDate"] || "",
        purchasePrice: row["purchasePrice"] || "",
        warrantyStart: row["warrantyStart"] || "",
        warrantyEnd: row["warrantyEnd"] || "",
        warrantyYears: row["warrantyYears"] || "",
        remarks: row["remarks"] || "",
        surveyStatus: row["surveyStatus"] || "",
        upgradeEquipments: row["upgradeEquipments"] || "",
        surveyTakenBy: row["surveyTakenBy"] || "",
        employeeId: store.employeeId,
        vendorId: store.vendorId,
      };
      if (newAssetData.equipment.trim() === "" && newAssetData.company.trim() === "") {
        continue; // Skip this row if both assetCode and equipment are empty
      }

      const createdAsset = await Asset.create(newAssetData);
      assetsCreated++;

      const updatedEmployee = await Employee.findByIdAndUpdate(
        store.employeeId,
        {
          $push: {
            assetlist: String(createdAsset._id),
          },
        },
        {
          returnDocument: "after",
        },
      );

      // store reset
      store.employeeId = "";
      store.vendorId = "";
    }

    // ------------------------------------
  } catch (error) {
    console.error("[Import] Failed:", error);

    return res.status(500).json({
      success: false,
      message: "Import failed.",
      error: error.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Import completed successfully.",
    totalRows: rows.length,
    assetsCreated,
    employeesCreated,
    employeesExisting,
    vendorsCreated,
    vendorsExisting,
  });
};
