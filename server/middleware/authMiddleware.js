const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not Authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

// Role-based access control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
};

// Admin only middleware
const adminOnly = [authMiddleware, requireRole('admin')];

// Staff or Admin middleware
const staffOrAdmin = [authMiddleware, requireRole('staff', 'admin')];

// Customer, Staff or Admin middleware
const authenticated = [authMiddleware, requireRole('customer', 'staff', 'admin')];

module.exports = {
  authMiddleware,
  requireRole,
  adminOnly,
  staffOrAdmin,
  authenticated
};
