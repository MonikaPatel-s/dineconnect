const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { adminOnly } = require("../middleware/authMiddleware");

// Validate coupon (customer use)
router.post("/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ message: "Coupon limit reached" });
    if (coupon.expiryDate && new Date() > coupon.expiryDate) return res.status(400).json({ message: "Coupon expired" });
    if (orderAmount < coupon.minOrderAmount) return res.status(400).json({ message: `Minimum order ₹${coupon.minOrderAmount} required` });

    const discountAmount = coupon.discountType === 'percent' 
      ? Math.round(orderAmount * coupon.discountValue / 100)
      : Math.min(coupon.discountValue, orderAmount);

    res.json({ 
      valid: true, 
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: `${coupon.discountType === 'percent' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} OFF applied!`
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all coupons (Admin)
router.get("/", adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create coupon (Admin)
router.post("/", adminOnly, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Coupon code already exists" });
    res.status(500).json({ message: "Server error" });
  }
});

// Delete coupon (Admin)
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle coupon active (Admin)
router.patch("/:id/toggle", adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
