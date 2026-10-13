
import mongoose from "mongoose";

const monthlyReadingSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    year: { type: Number, required: true },

    bwStart: { type: Number, default: 0 },
    bwEnd: { type: Number, default: 0 },

    colorStart: { type: Number, default: 0 },
    colorEnd: { type: Number, default: 0 },

    remarks: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const readingSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    monthlyReading: [monthlyReadingSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Reading", readingSchema);
