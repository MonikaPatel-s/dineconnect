const express = require('express');
const router = express.Router();
const RestaurantReview = require('../models/RestaurantReview');

// Get all restaurant reviews (public - for login page)
router.get('/', async (req, res) => {
  try {
    const reviews = await RestaurantReview.find()
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a restaurant review (no auth needed - guest can review)
router.post('/', async (req, res) => {
  try {
    const { customerName, rating, description, orderId, tableNumber } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating 1-5 required' });
    }
    const review = new RestaurantReview({
      customerName: customerName || 'Guest',
      rating,
      description: description || '',
      orderId,
      tableNumber
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
