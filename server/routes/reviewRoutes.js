const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const MenuItem = require('../models/Menu');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get reviews for a menu item
router.get('/menu/:menuItemId', async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuItemId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add/Update review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { menuItemId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if review already exists
    let review = await Review.findOne({ user: userId, menuItem: menuItemId });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = new Review({
        user: userId,
        menuItem: menuItemId,
        rating,
        comment
      });
      await review.save();
    }

    // Update menu item average rating
    await updateMenuItemRating(menuItemId);

    await review.populate('user', 'name');
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete review
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const menuItemId = review.menuItem;
    await Review.findByIdAndDelete(req.params.reviewId);
    
    // Update menu item average rating
    await updateMenuItemRating(menuItemId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update menu item rating
async function updateMenuItemRating(menuItemId) {
  const reviews = await Review.find({ menuItem: menuItemId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  await MenuItem.findByIdAndUpdate(menuItemId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews
  });
}

module.exports = router;