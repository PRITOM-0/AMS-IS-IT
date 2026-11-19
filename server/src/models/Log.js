import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    performar: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    on: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    employeename: {
      type: String,
      default: "",
      trim: true,
    },
    assetname: {
      type: String,
      default: "",
      trim: true,
    },
    assetcode: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    vendorname: {
      type: String,
      trim: true,
    }
  }
   
);

export default mongoose.model("Log", logSchema);