const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userRole = role || "customer";

    // Sirf ek admin allowed hai
    if (userRole === 'admin') {
      return res.status(403).json({ message: "Admin account already exists. Contact system administrator." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let customerNumber = null;
    if (userRole === "customer") {
      const customerCount = await User.countDocuments({ role: "customer" });
      customerNumber = customerCount + 1;
    }

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: userRole,
      customerNumber,
      isApproved: userRole === 'customer' ? true : false // customers auto approved, staff needs admin approval
    });

    res.json({ message: "Registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  // Role mismatch check - same email se dusre role mein login nahi hoga
  // Frontend se role pass karo verification ke liye
  const requestedRole = req.body.requestedRole;
  if (requestedRole && user.role !== requestedRole) {
    return res.status(403).json({ 
      message: `This email is registered as ${user.role}. Please use the correct login section.` 
    });
  }

  // Staff approval check
  if (user.role === 'staff' && !user.isApproved) {
    return res.status(403).json({ 
      message: "pending_approval",
      name: user.name 
    });
  }

  // Check if this is the 10000th customer
  const isSpecialCustomer = user.customerNumber === 10000;

  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ 
    message: "Login successful", 
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      customerNumber: user.customerNumber,
      specialDiscount: isSpecialCustomer ? { discount: 50, message: "🎉 You are our 10,000th customer! Enjoy 50% OFF!" } : null
    }
  });
});

// GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
  try {
    const { email, name, picture, googleId, role } = req.body;

    console.log('🔍 Google login attempt:', { email, name, googleId });

    // Check if user already exists by email or googleId
    let user = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    if (user) {
      // User exists, update Google ID and picture if needed
      if (!user.googleId || user.googleId !== googleId) {
        user.googleId = googleId;
      }
      if (picture) {
        user.picture = picture;
      }
      // Ensure role is customer for demo accounts
      if (['pranav@gmail.com', 'lucky@gmail.com', 'monika@gmail.com'].includes(email)) {
        user.role = 'customer';
      }
      await user.save();
      console.log('✅ Existing user found:', user.email);
    } else {
      // Create new user with Google data
      try {
        user = await User.create({
          name,
          email,
          googleId,
          picture,
          role: role || "customer",
          passwordHash: null, // No password for Google users
          isGoogleUser: true
        });
        console.log('✅ New Google user created:', user.email);
      } catch (createError) {
        // Handle duplicate key error
        if (createError.code === 11000) {
          // Try to find existing user and update
          user = await User.findOne({ 
            $or: [{ email }, { googleId }] 
          });
          if (user) {
            user.role = role || "customer";
            await user.save();
            console.log('✅ Found existing user after duplicate error:', user.email);
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }

    // Assign customer number to new Google users
    if (!user.customerNumber && user.role === 'customer') {
      const customerCount = await User.countDocuments({ role: "customer" });
      user.customerNumber = customerCount;
      await user.save();
    }

    // Check if 10000th customer
    const isSpecialCustomer = user.customerNumber === 10000;

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name,
        email: user.email,
        picture: user.picture 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Google login successful", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture,
        customerNumber: user.customerNumber,
        specialDiscount: isSpecialCustomer ? { discount: 50, message: "🎉 You are our 10,000th customer! Enjoy 50% OFF!" } : null
      }
    });

  } catch (error) {
    console.error('❌ Google login error:', error);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
});

// Get pending staff approvals (Admin only)
router.get("/pending-staff", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: "Admin only" });

    const pendingStaff = await User.find({ role: 'staff', isApproved: false })
      .select('name email createdAt');
    res.json(pendingStaff);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Approve/Reject staff (Admin only)
router.patch("/approve-staff/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: "Admin only" });

    const { approve } = req.body;
    if (approve) {
      await User.findByIdAndUpdate(req.params.id, { isApproved: true });
      res.json({ message: "Staff approved!" });
    } else {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "Staff rejected and removed." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
