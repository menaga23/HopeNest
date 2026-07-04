const express = require('express');
const router = express.Router();
const Orphanage = require('../models/Orphanage');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/orphanages
// @desc    Retrieve all orphanages with filtering (city, capacity, approval, admin)
router.get('/', async (req, res) => {
  try {
    const { city, capacity, adminId, all } = req.query;
    let query = {};

    // Standard public filter: only approved orphanages
    if (all !== 'true') {
      query.isApproved = true;
    }

    // Specific filters
    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }
    if (adminId) {
      query.adminId = adminId;
    }

    const orphanages = await Orphanage.find(query).populate('adminId', 'name email');
    res.json(orphanages);
  } catch (error) {
    console.error("Fetch Orphanages Error:", error);
    res.status(500).json({ error: "Failed to fetch orphanages." });
  }
});

// @route   GET /api/orphanages/:id
// @desc    Retrieve details for a single orphanage
router.get('/:id', async (req, res) => {
  try {
    const orphanage = await Orphanage.findById(req.params.id).populate('adminId', 'name email');
    if (!orphanage) {
      return res.status(404).json({ error: "Orphanage not found." });
    }
    res.json(orphanage);
  } catch (error) {
    console.error("Fetch Orphanage Error:", error);
    res.status(500).json({ error: "Failed to fetch orphanage details." });
  }
});

// @route   POST /api/orphanages
// @desc    Create a new orphanage (requires Admin registration)
router.post('/', auth, requireRole(['orphanageAdmin', 'superAdmin']), async (req, res) => {
  try {
    const { name, description, address, city, location, capacity, contact, photos } = req.body;
    
    // Check if admin already registered an orphanage
    const existing = await Orphanage.findOne({ adminId: req.user._id });
    if (existing && req.user.role !== 'superAdmin') {
      return res.status(400).json({ error: "An admin account can only register one orphanage." });
    }

    const orphanage = new Orphanage({
      name,
      description,
      address,
      city,
      location: location || { lat: 12.9716, lng: 77.5946 }, // default to Bengaluru if not given
      capacity,
      photos: photos || [],
      contact: contact || { phone: req.user.phone, email: req.user.email },
      adminId: req.user._id,
      isApproved: req.user.role === 'superAdmin' // auto-approve if superadmin creates it
    });

    await orphanage.save();
    res.status(201).json(orphanage);
  } catch (error) {
    console.error("Create Orphanage Error:", error);
    res.status(500).json({ error: "Failed to submit orphanage application." });
  }
});

// @route   PUT /api/orphanages/:id
// @desc    Update orphanage details (name, description, capacity, needs list)
router.put('/:id', auth, async (req, res) => {
  try {
    const orphanage = await Orphanage.findById(req.params.id);
    if (!orphanage) {
      return res.status(404).json({ error: "Orphanage not found." });
    }

    // Authorization check: Only the assigned admin or a superAdmin can update
    const isOwner = orphanage.adminId.toString() === req.user._id.toString();
    const isSuper = req.user.role === 'superAdmin';
    if (!isOwner && !isSuper) {
      return res.status(403).json({ error: "Unauthorized update request." });
    }

    const { name, description, address, city, location, capacity, needs, contact, isApproved } = req.body;
    
    if (name) orphanage.name = name;
    if (description) orphanage.description = description;
    if (address) orphanage.address = address;
    if (city) orphanage.city = city;
    if (location) orphanage.location = location;
    if (capacity !== undefined) orphanage.capacity = capacity;
    if (needs) orphanage.needs = needs;
    if (contact) orphanage.contact = contact;
    
    // SuperAdmin approval toggles
    if (isApproved !== undefined && isSuper) {
      orphanage.isApproved = isApproved;
    }

    await orphanage.save();
    res.json(orphanage);
  } catch (error) {
    console.error("Update Orphanage Error:", error);
    res.status(500).json({ error: "Failed to update orphanage details." });
  }
});

// @route   PUT /api/orphanages/:id/approve
// @desc    Approve/Reject orphanage registration (Super Admin only)
router.put('/:id/approve', auth, requireRole('superAdmin'), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const orphanage = await Orphanage.findById(req.params.id);
    if (!orphanage) {
      return res.status(404).json({ error: "Orphanage not found." });
    }

    orphanage.isApproved = isApproved;
    await orphanage.save();
    res.json({ message: `Orphanage approval status set to ${isApproved}`, orphanage });
  } catch (error) {
    console.error("Approve Orphanage Error:", error);
    res.status(500).json({ error: "Failed to update approval status." });
  }
});

module.exports = router;
