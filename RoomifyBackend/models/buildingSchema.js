const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    floors: { type: Number, required: true },
  },
  { collection: "buildings", versionKey: false }
);

module.exports = mongoose.model("buildings", buildingSchema);