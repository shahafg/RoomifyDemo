const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  },
  { collection: "messages", versionKey: false }
);

module.exports = mongoose.model("messages", messageSchema);