const mongoose = require("mongoose");

const restaurantReviewSchema = new mongoose.Schema({
  customerName: { type: String, default: 'Guest' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  description: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  tableNumber: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("RestaurantReview", restaurantReviewSchema);
