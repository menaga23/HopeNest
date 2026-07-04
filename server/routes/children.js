const express = require('express');
const router = express.Router();
const Child = require('../models/Child');
const Orphanage = require('../models/Orphanage');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/children
// @desc    Retrieve all children with optional filters (age, orphanage, sponsor status, adoption status)
router.get('/', async (req, res) => {
  try {
    const { ageMin, ageMax, orphanageId, sponsorStatus, adoptionStatus } = req.query;
    let query = {};

    if (orphanageId) {
      query.orphanageId = orphanageId;
    }
    if (sponsorStatus) {
      query.sponsorStatus = sponsorStatus;
    }
    if (adoptionStatus) {
      query.adoptionStatus = adoptionStatus;
    }
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }

    const children = await Child.find(query).populate('orphanageId', 'name city');
    res.json(children);
  } catch (error) {
    console.error("Fetch Children Error:", error);
    res.status(500).json({ error: "Failed to retrieve children records." });
  }
});

// @route   GET /api/children/:id
// @desc    Retrieve single child record details
router.get('/:id', async (req, res) => {
  try {
    const child = await Child.findById(req.params.id).populate('orphanageId', 'name city contact address');
    if (!child) {
      return res.status(404).json({ error: "Child record not found." });
    }
    res.json(child);
  } catch (error) {
    console.error("Fetch Child Detail Error:", error);
    res.status(500).json({ error: "Failed to retrieve child details." });
  }
});

// @route   POST /api/children
// @desc    Add a new child profile (Orphanage Admins only)
router.post('/', auth, requireRole(['orphanageAdmin', 'superAdmin']), async (req, res) => {
  try {
    const { firstName, age, gender, photo, story, orphanageId } = req.body;

    // Verify orphanage admin owns the target orphanage
    if (req.user.role !== 'superAdmin') {
      const orphanage = await Orphanage.findOne({ adminId: req.user._id });
      if (!orphanage || orphanage._id.toString() !== orphanageId) {
        return res.status(403).json({ error: "Access denied. You do not manage this orphanage." });
      }
    }

    const child = new Child({
      firstName,
      age,
      gender,
      photo,
      story,
      orphanageId,
      sponsorStatus: 'available',
      adoptionStatus: 'available'
    });

    await child.save();

    // Increment current children count of orphanage
    await Orphanage.findByIdAndUpdate(orphanageId, { $inc: { currentChildren: 1 } });

    res.status(201).json(child);
  } catch (error) {
    console.error("Create Child Profile Error:", error);
    res.status(500).json({ error: "Failed to create child record." });
  }
});

// @route   PUT /api/children/:id
// @desc    Modify child profile or update sponsorship status
router.put('/:id', auth, requireRole(['orphanageAdmin', 'superAdmin']), async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: "Child record not found." });
    }

    // Verify ownership of the child's orphanage
    if (req.user.role !== 'superAdmin') {
      const orphanage = await Orphanage.findOne({ adminId: req.user._id });
      if (!orphanage || orphanage._id.toString() !== child.orphanageId.toString()) {
        return res.status(403).json({ error: "Access denied. You do not manage this child's orphanage." });
      }
    }

    const { firstName, age, gender, photo, story, sponsorStatus, adoptionStatus, sponsoredBy } = req.body;

    if (firstName) child.firstName = firstName;
    if (age !== undefined) child.age = age;
    if (gender) child.gender = gender;
    if (photo) child.photo = photo;
    if (story) child.story = story;
    if (sponsorStatus) child.sponsorStatus = sponsorStatus;
    if (adoptionStatus) child.adoptionStatus = adoptionStatus;
    if (sponsoredBy !== undefined) child.sponsoredBy = sponsoredBy;

    await child.save();
    res.json(child);
  } catch (error) {
    console.error("Update Child Profile Error:", error);
    res.status(500).json({ error: "Failed to update child details." });
  }
});

// @route   PUT /api/children/:id/sponsor
// @desc    Sponsor a child (Public users allowed)
router.put('/:id/sponsor', auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id).populate('orphanageId', 'name');
    if (!child) {
      return res.status(404).json({ error: "Child record not found." });
    }
    if (child.sponsorStatus === 'sponsored') {
      return res.status(400).json({ error: "This child is already sponsored." });
    }
    
    const { amount } = req.body;
    child.sponsorStatus = 'sponsored';
    child.sponsoredBy = req.user._id;
    await child.save();

    // Increment impact metrics
    const Impact = require('../models/Impact');
    const sendEmail = require('../utils/sendEmail');
    
    let impact = await Impact.findOne({});
    if (!impact) {
      impact = new Impact({ totalMeals: 0, totalVolunteers: 0, totalFunds: 0, totalSponsored: 0 });
    }
    impact.totalSponsored += 1;
    impact.totalFunds += parseFloat(amount) || 0;
    await impact.save();

    // Trigger Socket.io realtime notification
    const io = req.app.get('io');
    if (io) {
      io.emit('newActivity', {
        type: 'sponsor',
        sponsorName: req.user.name,
        childName: child.firstName,
        orphanageName: child.orphanageId.name,
        amount: parseFloat(amount) || 1000,
        date: new Date()
      });
    }

    // Send confirmation email
    const emailSubject = `HopeNest - Sponsorship Confirmed for ${child.firstName}`;
    const emailText = `Dear ${req.user.name},\n\n` +
      `Thank you so much for sponsoring ${child.firstName} at ${child.orphanageId.name}!\n` +
      `Your monthly contribution of ₹${amount} will cover:\n` +
      `${amount == 500 ? '- Nutritious daily meals\n' : amount == 1000 ? '- Nutritious daily meals\n- Primary/Secondary Schooling expenses & uniforms\n' : '- Nutritious daily meals\n- Primary/Secondary Schooling expenses & uniforms\n- Medical checkups & mental care support\n'}` +
      `You have brought vital support and futures to ${child.firstName}. We will email you progress cards periodically.\n\n` +
      `With warm regards,\n` +
      `The HopeNest Team`;

    await sendEmail({
      to: req.user.email,
      subject: emailSubject,
      text: emailText
    });

    res.json(child);
  } catch (error) {
    console.error("Sponsor Child Error:", error);
    res.status(500).json({ error: "Failed to establish child sponsorship." });
  }
});

// @route   DELETE /api/children/:id
// @desc    Delete child record (Orphanage Admins only)
router.delete('/:id', auth, requireRole(['orphanageAdmin', 'superAdmin']), async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ error: "Child not found" });

    // Verify ownership
    if (req.user.role !== 'superAdmin') {
      const orphanage = await Orphanage.findOne({ adminId: req.user._id });
      if (!orphanage || orphanage._id.toString() !== child.orphanageId.toString()) {
        return res.status(403).json({ error: "Unauthorized deletion." });
      }
    }

    const orphanageId = child.orphanageId;
    await child.deleteOne();
    
    // Decrement child count of orphanage
    await Orphanage.findByIdAndUpdate(orphanageId, { $inc: { currentChildren: -1 } });

    res.json({ message: "Child profile deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete child record." });
  }
});

module.exports = router;
