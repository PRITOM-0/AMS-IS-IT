import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      default: "",
    },

    vendorName: {
      type: String,
      default: "",
    },

    serviceCost: {
      type: String,
      default: "",
    },

    serviceWarranty: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },

    serviceDate: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "",
    },

    createAt: {
      type: String,
      default: () => new Date().toISOString(),
    },

    updateAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("Service", serviceSchema);