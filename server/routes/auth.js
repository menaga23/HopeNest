const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// JWT generation helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hopenest_super_secret_session_key_2026', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (donor, volunteer, orphanage admin, or super admin)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, photo } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // Create user instance
    user = new User({
      name,
      email,
      password,
      role: role || 'public',
      phone: phone || '',
      address: address || '',
      photo: photo || ''
    });

    await user.save();
    
    // Generate session JWT
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Server registration failed. Please try again." });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return session token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Search user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate session token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server login failed. Please try again." });
  }
});

// @route   GET /api/auth/me
// @desc    Fetch authenticated user details
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, photo } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (photo) user.photo = photo;

    await user.save();
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Profile update failed" });
  }
});

module.exports = router;
