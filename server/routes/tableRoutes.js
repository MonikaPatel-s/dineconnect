const express = require("express");
const router = express.Router();
const Table = require("../models/Table");
const { adminOnly, authMiddleware } = require("../middleware/authMiddleware");
const QRCode = require('qrcode');

// Get all tables (Admin only)
router.get("/", adminOnly, async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get public tables info (for customers to see QR codes)
router.get("/public", async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true })
      .select('number capacity qrSlug')
      .sort({ number: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new table (Admin only)
router.post("/", adminOnly, async (req, res) => {
  try {
    const { number, capacity } = req.body;
    
    // Generate unique QR slug
    const qrSlug = `table-${number}-${Date.now()}`;
    
    const table = new Table({
      number,
      qrSlug,
      capacity: capacity || 4
    });
    
    await table.save();
    res.json(table);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Table number already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// Generate QR code for table (Admin only)
router.get("/:id/qr", adminOnly, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }
    
    const menuUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/m/${table.qrSlug}`;
    const qrCodeDataURL = await QRCode.toDataURL(menuUrl);
    
    res.json({
      qrCode: qrCodeDataURL,
      menuUrl,
      tableNumber: table.number
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get table by QR slug (Public)
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const table = await Table.findOne({ qrSlug: req.params.slug, isActive: true });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }
    
    res.json({
      tableId: table._id,
      number: table.number,
      capacity: table.capacity
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update table (Admin only)
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete table (Admin only)
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: "Table deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;