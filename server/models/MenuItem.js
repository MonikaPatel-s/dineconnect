const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory" },
  imageUrl: { type: String },
  availability: { type: Boolean, default: true },
  tags: [{ type: String }]
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
