const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate any request using JWT header
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hopenest_super_secret_session_key_2026');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: "User session not found. Please log in again." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid session token. Please log in again." });
  }
};

// Middleware to enforce specific roles (public, orphanageAdmin, superAdmin)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    
    // Convert single string role to array if necessary
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    
    next();
  };
};

module.exports = { auth, requireRole };
