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
    accessible: { type: Boolean, required: true },
    facilities: {
      projector: { type: Boolean, default: false },
      whiteboard: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      computers: { type: Boolean, default: false },
      smartBoard: { type: Boolean, default: false },
      audioSystem: { type: Boolean, default: false }
    }
  },
  { collection: "rooms", versionKey: false }
);

module.exports = mongoose.model("rooms", roomSchema);