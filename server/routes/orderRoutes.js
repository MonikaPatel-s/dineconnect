const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const MenuItem = require("../models/Menu");
const Table = require("../models/Table");
const { authMiddleware, staffOrAdmin, authenticated } = require("../middleware/authMiddleware");

// Create Order (Customer or Guest)
router.post("/", async (req, res) => {
  try {
    const { tableId, items, guestSession, paymentData } = req.body;
    console.log('📝 Order creation request:', { 
      tableId, 
      itemsCount: items?.length, 
      guestSession, 
      paymentMethod: paymentData?.method 
    });
    
    // Check if user is authenticated
    const token = req.headers.authorization?.split(" ")[1];
    let customerId = null;
    
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        customerId = decoded.id;
      } catch (error) {
        // Token invalid, continue as guest
        console.log('Invalid token, continuing as guest');
      }
    }

    // Validate or assign table
    let table;
    if (tableId) {
      table = await Table.findById(tableId);
      if (!table) {
        return res.status(400).json({ message: "Invalid table" });
      }
    } else {
      // Assign first available table if none specified
      table = await Table.findOne({});
      if (!table) {
        return res.status(400).json({ message: "No tables available" });
      }
    }

    // Validate guest session or customer ID
    if (!customerId && !guestSession) {
      return res.status(400).json({ 
        message: "Either customer authentication or guest session required" 
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.availability) {
        return res.status(400).json({ 
          message: `Menu item not available: ${item.menuItemId}` 
        });
      }
      
      const itemTotal = menuItem.price * item.qty;
      subtotal += itemTotal;
      
      orderItems.push({
        menuItemId: item.menuItemId,
        qty: item.qty,
        note: item.note || "",
        price: menuItem.price
      });
    }

    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
    const total = Math.round((subtotal + tax) * 100) / 100;

    const order = new Order({
      tableId: table._id,
      customerId,
      guestSession,
      customerName: customerId ? (await require('../models/User').findById(customerId).select('name'))?.name || 'Customer' : 'Guest Customer',
      items: orderItems,
      subtotal,
      tax,
      total,
      paymentStatus: (paymentData && paymentData.method === 'cod') ? "pending" : 
                    (paymentData && paymentData.status === 'success') ? "paid" : "pending",
      paymentData: paymentData ? {
        method: paymentData.method,
        transactionId: paymentData.transactionId,
        timestamp: new Date(paymentData.timestamp),
        amount: paymentData.amount
      } : undefined
    });

    await order.save();
    
    // Mark table as occupied when order is placed
    await Table.findByIdAndUpdate(table._id, { status: 'occupied' });
    
    await order.populate([
      { path: 'tableId', select: 'number' },
      { path: 'items.menuItemId', select: 'name price imageUrl' }
    ]);

    // Send real-time notification to kitchen staff
    if (global.io) {
      global.io.to('kitchen').emit('new-order-alert', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableNumber: table.number,
        items: order.items,
        total: order.total,
        customerName: req.user?.name || 'Guest Customer',
        timestamp: new Date()
      });
    }

    res.json(order);
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get Customer Order History
router.get("/customer/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ customerId: userId })
      .populate('tableId', 'number')
      .populate('items.menuItemId', 'name price imageUrl')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (error) {
    console.error('Order history error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Orders (Staff/Admin)
router.get("/", staffOrAdmin, async (req, res) => {
  try {
    const { status, table, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (table) query.tableId = table;

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('tableId', 'number')
      .populate('customerId', 'name email')
      .populate('items.menuItemId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Order Status (Staff/Admin)
router.patch("/:id/status", staffOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['placed', 'preparing', 'ready', 'served', 'canceled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate([
      { path: 'tableId', select: 'number' },
      { path: 'items.menuItemId', select: 'name price' },
      { path: 'customerId', select: 'name' }
    ]);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // When order is served or canceled, free up the table
    if (status === 'served' || status === 'canceled') {
      // Check if any other active orders exist for this table
      const activeOrders = await Order.countDocuments({
        tableId: order.tableId._id,
        status: { $in: ['placed', 'preparing', 'ready'] },
        _id: { $ne: order._id }
      });
      if (activeOrders === 0) {
        await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
      }

      // Send rating notification after 15 minutes when order is served
      if (status === 'served' && global.io) {
        setTimeout(() => {
          global.io.to(`table-${order.tableId._id}`).emit('rating-request', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            tableNumber: order.tableId.number,
            customerName: order.customerId?.name || order.customerName || 'Guest',
            message: 'How was your experience? Please rate us!'
          });
        }, 10 * 60 * 1000); // 10 minutes
      }
    }

    // Send real-time notification to customer
    if (global.io && order.tableId) {
      const statusMessages = {
        'placed': '🍽️ Your order has been placed successfully!',
        'preparing': '👨‍🍳 Your order is being prepared in the kitchen',
        'ready': '✅ Your order is ready for pickup!',
        'served': '🎉 Your order has been served. Enjoy your meal!'
      };

      global.io.to(`table-${order.tableId._id}`).emit('order-update', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: status,
        message: statusMessages[status] || 'Order status updated',
        tableNumber: order.tableId.number,
        timestamp: new Date()
      });

      // Also notify kitchen staff
      global.io.to('kitchen').emit('kitchen-update', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: status,
        tableNumber: order.tableId.number,
        customerName: order.customerId?.name || 'Guest Customer',
        timestamp: new Date()
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
