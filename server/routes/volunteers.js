const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Orphanage = require('../models/Orphanage');
const Impact = require('../models/Impact');
const { auth, requireRole } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/volunteers
// @desc    Register to volunteer for an orphanage visit
router.post('/', auth, async (req, res) => {
  try {
    const { orphanageId, visitDate, reason } = req.body;

    const orphanage = await Orphanage.findById(orphanageId);
    if (!orphanage) {
      return res.status(404).json({ error: "Orphanage not found." });
    }

    const volunteer = new Volunteer({
      userId: req.user._id,
      orphanageId,
      visitDate: new Date(visitDate),
      reason,
      status: 'pending'
    });

    await volunteer.save();

    // Trigger Socket.io notification to orphanage admin
    const io = req.app.get('io');
    if (io) {
      io.emit('newActivity', {
        type: 'volunteer',
        volunteerName: req.user.name,
        orphanageName: orphanage.name,
        date: new Date()
      });
    }

    // Email user copy
    await sendEmail({
      to: req.user.email,
      subject: "HopeNest - Volunteer Registration Received",
      text: `Dear ${req.user.name},\n\n` +
        `Your request to volunteer at ${orphanage.name} on ${new Date(visitDate).toDateString()} has been received.\n` +
        `The orphanage administrator will review your application and update your schedule.\n\n` +
        `Reason for visit: "${reason}"\n\n` +
        `Thank you for your willingness to dedicate your time!\n\n` +
        `Warmly,\n` +
        `The HopeNest Team`
    });

    res.status(201).json(volunteer);
  } catch (error) {
    console.error("Post Volunteer Error:", error);
    res.status(500).json({ error: "Failed to submit volunteer registration." });
  }
});

// @route   GET /api/volunteers/my
// @desc    Retrieve logged-in user's volunteer schedule
router.get('/my', auth, async (req, res) => {
  try {
    const schedules = await Volunteer.find({ userId: req.user._id })
      .populate('orphanageId', 'name city address contact')
      .sort({ visitDate: -1 });
    res.json(schedules);
  } catch (error) {
    console.error("Fetch User Volunteers Error:", error);
    res.status(500).json({ error: "Failed to retrieve volunteer schedule." });
  }
});

// @route   GET /api/volunteers/orphanage/:id
// @desc    Retrieve all volunteer requests for an orphanage (Orphanage Admins only)
router.get('/orphanage/:id', auth, async (req, res) => {
  try {
    const orphanage = await Orphanage.findById(req.params.id);
    if (!orphanage) {
      return res.status(404).json({ error: "Orphanage not found." });
    }

    // Verify ownership
    const isOwner = orphanage.adminId.toString() === req.user._id.toString();
    const isSuper = req.user.role === 'superAdmin';
    if (!isOwner && !isSuper) {
      return res.status(403).json({ error: "Unauthorized access." });
    }

    const requests = await Volunteer.find({ orphanageId: req.params.id })
      .populate('userId', 'name email phone photo')
      .sort({ visitDate: 1 });

    res.json(requests);
  } catch (error) {
    console.error("Fetch Orphanage Volunteers Error:", error);
    res.status(500).json({ error: "Failed to load volunteer requests." });
  }
});

// @route   PUT /api/volunteers/:id/status
// @desc    Approve/Reject volunteer requests and add comments (Orphanage Admins only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const volunteer = await Volunteer.findById(req.params.id).populate('userId', 'name email');
    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer record not found." });
    }

    const orphanage = await Orphanage.findById(volunteer.orphanageId);
    
    // Verify admin owns this orphanage
    const isOwner = orphanage.adminId.toString() === req.user._id.toString();
    const isSuper = req.user.role === 'superAdmin';
    if (!isOwner && !isSuper) {
      return res.status(403).json({ error: "Unauthorized update request." });
    }

    const previousStatus = volunteer.status;
    volunteer.status = status;
    volunteer.adminNote = adminNote || '';
    await volunteer.save();

    // Increment impact metrics if approved
    if (status === 'approved' && previousStatus !== 'approved') {
      let impact = await Impact.findOne({});
      if (!impact) {
        impact = new Impact({ totalMeals: 0, totalVolunteers: 0, totalFunds: 0, totalSponsored: 0 });
      }
      impact.totalVolunteers += 1;
      await impact.save();
    }

    // Send status change notification email to volunteer
    await sendEmail({
      to: volunteer.userId.email,
      subject: `HopeNest - Volunteer Request Update (${status.toUpperCase()})`,
      text: `Dear ${volunteer.userId.name},\n\n` +
        `Your request to volunteer at ${orphanage.name} on ${volunteer.visitDate.toDateString()} has been ${status}.\n` +
        `${adminNote ? `Orphanage Note: "${adminNote}"\n` : ''}\n` +
        `Thank you for your interest in helping our children!\n\n` +
        `Warmly,\n` +
        `The HopeNest Team`
    });

    res.json(volunteer);
  } catch (error) {
    console.error("Update Volunteer Error:", error);
    res.status(500).json({ error: "Failed to update volunteer request status." });
  }
});

module.exports = router;
