import mongoose from "mongoose";

const oldUserSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      default: "",
    },

    employeeId: {
      type: String,
      default: "",
    },

    receivedDate: {
      type: String,
      default: "",
    },

    releaseDate: {
      type: String,
      default: "",
    },

    releaseNote: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const assetSchema = new mongoose.Schema(
  {
    equipment: {
      type: String,
      default: "",
    },

    assetCode: {
      type: String,
      default: "",
    },

    brand: {
      type: String,
      default: "",
    },

    model: {
      type: String,
      default: "",
    },

    serialNumber: {
      type: String,
      default: "",
    },

    specifications: {
      type: String,
      default: "",
    },

    macAddress: {
      type: String,
      default: "",
    },
    ecfNumber: {
      type: String,
      default: "",
    },
    workOrderNumber: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    floor: {
      type: String,
      default: "",
    },

    room: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "",
    },

    employeeId: {
      type: String,
      default: "",
    },

    receivedDate: {
      type: String,
      default: "",
    },

    oldUsers: {
      type: [oldUserSchema],
      default: [],
    },

    purchaseDate: {
      type: String,
      default: "",
    },

    purchasePrice: {
      type: String,
      default: "",
    },

    warrantyStart: {
      type: String,
      default: "",
    },

    warrantyEnd: {
      type: String,
      default: "",
    },

    warrantyYears: {
      type: String,
      default: "",
    },

    vendorId: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },

    surveyStatus: {
      type: String,
      default: "",
    },

    upgradeEquipments: {
      type: String,
      default: "",
    },

    surveyTakenBy: {
      type: String,
      default: "",
    },

    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },

    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("Asset", assetSchema);