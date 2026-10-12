import mongoose from "mongoose";

const assetSnapshotSchema = new mongoose.Schema(
  {
    assetCode: { type: String, default: "" },
    equipment: { type: String, default: "" },
    brand: { type: String, default: "" },
    model: { type: String, default: "" },
    serialNumber: { type: String, default: "" },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    department: { type: String, default: "" },
    floor: { type: String, default: "" },
    room: { type: String, default: "" },
    status: { type: String, default: "" },
  },
  { _id: false },
);

const readingSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    asset: {
      type: assetSnapshotSchema,
      required: true,
    },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, min: 2000, required: true },
    bwStartReading: { type: Number, min: 0 },
    bwEndReading: { type: Number, min: 0 },
    colorStartReading: { type: Number, min: 0 },
    colorEndReading: { type: Number, min: 0 },
    remarks: { type: String, default: "", maxlength: 4000 },
    startReading: { type: Number, min: 0 },
    endReading: { type: Number, min: 0 },
  },
  { timestamps: true, versionKey: false },
);

readingSchema.index({ assetId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model("Reading", readingSchema);
