const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get user's favorites
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('menuItem')
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to favorites
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { menuItemId } = req.body;
    const userId = req.user.id;

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({ 
      user: userId, 
      menuItem: menuItemId 
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Item already in favorites' });
    }

    const favorite = new Favorite({
      user: userId,
      menuItem: menuItemId
    });

    await favorite.save();
    await favorite.populate('menuItem');
    
    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove from favorites
router.delete('/:menuItemId', authMiddleware, async (req, res) => {
  try {
    const result = await Favorite.findOneAndDelete({
      user: req.user.id,
      menuItem: req.params.menuItemId
    });

    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if item is favorite
router.get('/check/:menuItemId', authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user.id,
      menuItem: req.params.menuItemId
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;