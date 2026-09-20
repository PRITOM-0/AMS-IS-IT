import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
    },

    designation: {
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

    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },

    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },

    assetlist: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("Employee", employeeSchema);