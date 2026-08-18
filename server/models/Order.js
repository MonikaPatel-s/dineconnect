const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
    price: { type: Number, required: true }, // Store price at time of order
    customizations: {
      spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'] },
      addOns: [{
        name: String,
        price: Number
      }],
      specialInstructions: String
    }
  }],
  status: { 
    type: String, 
    enum: ["placed", "preparing", "ready", "served", "canceled"], 
    default: "placed" 
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  paymentData: {
    method: { type: String, enum: ["upi", "card", "wallet", "cash", "cod"], default: "cash" },
    transactionId: { type: String },
    timestamp: { type: Date },
    amount: { type: Number }
  },
  guestSession: { type: String }, // For guest orders
  orderNumber: { type: String, unique: true }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
