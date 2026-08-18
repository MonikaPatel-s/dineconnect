const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: false },
  role: { type: String, enum: ["customer", "staff", "admin"], default: "customer" },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false }, // Staff approval by admin
  customerNumber: { type: Number, default: null },
  googleId: { type: String, unique: true, sparse: true },
  picture: { type: String },
  isGoogleUser: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
