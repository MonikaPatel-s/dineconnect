const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  qrSlug: { type: String, required: true, unique: true },
  activeSessionId: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  capacity: { type: Number, default: 4 }
}, {
  timestamps: true
});

module.exports = mongoose.model("Table", tableSchema);