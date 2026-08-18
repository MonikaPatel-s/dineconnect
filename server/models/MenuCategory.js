const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  icon: { type: String, default: "🍽️" }
}, {
  timestamps: true
});

module.exports = mongoose.model("MenuCategory", menuCategorySchema);
