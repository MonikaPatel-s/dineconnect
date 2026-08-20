const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const tableRoutes = require("./routes/tableRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const couponRoutes = require("./routes/couponRoutes");
const restaurantReviewRoutes = require("./routes/restaurantReviewRoutes");

const app = express();

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow all origins in development, specific in production
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Uploads folder setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + Date.now() + ext);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sirf images allowed hain!'));
  }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Routes Register
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/restaurant-reviews", restaurantReviewRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "DineConnect API is running" });
});

// Debug endpoint for frontend testing
app.post("/api/debug/test", (req, res) => {
  console.log('🧪 Debug endpoint called:', req.body);
  
  // Test notification broadcast
  if (global.io) {
    global.io.emit('order-update', {
      orderId: 'TEST123',
      status: 'preparing',
      message: '🧪 Test notification - Your order is being prepared!',
      timestamp: new Date()
    });
    console.log('📡 Test notification sent to all clients');
  }
  
  res.json({ 
    status: "OK", 
    message: "Debug endpoint working", 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dineconnect')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join room based on user role
  socket.on('join-room', (data) => {
    const { role, userId, tableId } = data;
    
    if (role === 'customer' && tableId) {
      socket.join(`table-${tableId}`);
      console.log(`👤 Customer joined table-${tableId}`);
    } else if (role === 'staff' || role === 'admin') {
      socket.join('kitchen');
      console.log(`👨‍🍳 ${role} joined kitchen`);
    }
    
    socket.userId = userId;
    socket.role = role;
  });

  // Handle order status updates
  socket.on('order-status-update', (data) => {
    const { orderId, status, tableId, customerInfo } = data;
    
    // Notify customer at specific table
    if (tableId) {
      io.to(`table-${tableId}`).emit('order-update', {
        orderId,
        status,
        message: getStatusMessage(status),
        timestamp: new Date()
      });
    }
    
    // Notify kitchen staff
    io.to('kitchen').emit('kitchen-update', {
      orderId,
      status,
      tableId,
      customerInfo,
      timestamp: new Date()
    });
  });

  // Handle new orders
  socket.on('new-order', (orderData) => {
    // Notify kitchen staff about new order
    io.to('kitchen').emit('new-order-alert', {
      ...orderData,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Helper function for status messages
function getStatusMessage(status) {
  const messages = {
    'placed': '🍽️ Your order has been placed successfully!',
    'preparing': '👨‍🍳 Your order is being prepared in the kitchen',
    'ready': '✅ Your order is ready for pickup!',
    'served': '🎉 Your order has been served. Enjoy your meal!'
  };
  return messages[status] || 'Order status updated';
}

// Make io available globally
global.io = io;

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ DineConnect Server running on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔔 Real-time notifications enabled`);
  
  // Get local IP for mobile access
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find Wi-Fi interface IP
  for (const name of Object.keys(interfaces)) {
    if (name.includes('Wi-Fi') || (name.includes('Wireless') && name.includes('Wi-Fi'))) {
      for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          localIP = interface.address;
          break;
        }
      }
    }
  }
  
  console.log(`📱 Mobile Access: http://${localIP}:${PORT}`);
});
