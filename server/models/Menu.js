const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
  imageUrl: { type: String, default: "" },
  availability: { type: Boolean, default: true },
  tags: [{ type: String }],
  popularity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  dietaryInfo: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isJain: { type: Boolean, default: false },
    spiceLevel: { 
      type: String, 
      enum: ['mild', 'medium', 'hot', 'extra-hot'],
      default: 'medium'
    }
  },
  customizations: {
    spiceLevels: [{ 
      type: String, 
      enum: ['mild', 'medium', 'hot', 'extra-hot'] 
    }],
    addOns: [{
      name: String,
      price: Number
    }],
    allowSpecialInstructions: { type: Boolean, default: true }
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }
}, {
  timestamps: true
});

// Index for search and filtering
menuItemSchema.index({ categoryId: 1, name: 1 });
menuItemSchema.index({ name: "text", tags: "text" });

module.exports = mongoose.model("MenuItem", menuItemSchema);
