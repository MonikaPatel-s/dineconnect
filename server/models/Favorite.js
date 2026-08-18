const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one favorite per user per menu item
favoriteSchema.index({ user: 1, menuItem: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);