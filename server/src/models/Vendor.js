import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      default: "",
    },
    vendorId: {
  type: String,
  default: "",
},

    contactPerson: {
      type: String,
      default: "",
    },

    contact: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("Vendor", vendorSchema);