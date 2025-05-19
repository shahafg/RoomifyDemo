const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    building: { type: String, required: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: { type: Number, required: true },
    accessible: { type: Boolean, required: true }
  },
  { collection: "rooms", versionKey: false }
);

module.exports = mongoose.model("rooms", roomSchema);