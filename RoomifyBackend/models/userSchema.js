const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    image: { type: String, default: null },
    role: { type: Number, default: 10 }
  },
  { collection: "users", versionKey: false }
);

module.exports = mongoose.model("users", userSchema);