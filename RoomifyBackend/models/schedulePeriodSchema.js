const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema({
  periodName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  originalStartTime: { type: String },
  originalEndTime: { type: String }
}, { _id: false });

const schedulePeriodSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    active: { type: String, required: true },
    period: { type: [periodSchema], required: true },
    updatedAt: { type: Date, required: true }
  },
  { collection: "schedulePeriods", versionKey: false }
);

module.exports = mongoose.model("schedulePeriods", schedulePeriodSchema);
