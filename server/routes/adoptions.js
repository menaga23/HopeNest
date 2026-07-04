const express = require('express');
const router = express.Router();
const Adoption = require('../models/Adoption');
const Child = require('../models/Child');
const Orphanage = require('../models/Orphanage');
const { auth, requireRole } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/adoptions
// @desc    Submit a new adoption application for a child
router.post('/', auth, async (req, res) => {
  try {
    const { childId, maritalStatus, annualIncome, employment, homeType, hasChildren, motivation, familyPhoto } = req.body;

    const child = await Child.findById(childId).populate('orphanageId', 'name');
    if (!child) {
      return res.status(404).json({ error: "Child record not found." });
    }

    if (child.adoptionStatus !== 'available') {
      return res.status(400).json({ error: "This child is currently not available for adoption inquiries." });
    }

    // Create adoption entry
    const adoption = new Adoption({
      familyId: req.user._id,
      childId,
      familyDetails: {
        maritalStatus,
        annualIncome: parseFloat(annualIncome),
        employment,
        homeType,
        hasChildren: hasChildren === 'true' || hasChildren === true,
        motivation
      },
      familyPhoto: familyPhoto || '',
      status: 'applied'
    });

    await adoption.save();

    // Set child's status to inquired
    child.adoptionStatus = 'inquired';
    await child.save();

    // Trigger Socket.io notification
    const io = req.app.get('io');
    if (io) {
      io.emit('newActivity', {
        type: 'adoption',
        familyName: req.user.name,
        childName: child.firstName,
        orphanageName: child.orphanageId.name,
        date: new Date()
      });
    }

    // Email family confirmation copy
    await sendEmail({
      to: req.user.email,
      subject: "HopeNest - Adoption Inquiry Submitted Successfully",
      text: `Dear ${req.user.name},\n\n` +
        `Thank you for submitting your adoption inquiry for ${child.firstName}.\n` +
        `Our team and the orphanage administrators are reviewing your application. You will be contacted for an interview session if the initial review is approved.\n\n` +
        `Application Details:\n` +
        `- Marital Status: ${maritalStatus}\n` +
        `- Current Employment: ${employment}\n` +
        `- Status: UNDER REVIEW\n\n` +
        `You can track the live progress of your application on your user dashboard.\n\n` +
        `With warmth,\n` +
        `The HopeNest Team`
    });

    res.status(201).json(adoption);
  } catch (error) {
    console.error("Post Adoption Error:", error);
    res.status(500).json({ error: "Failed to submit adoption inquiry." });
  }
});

// @route   GET /api/adoptions/my
// @desc    Retrieve logged-in user's adoption inquiries
router.get('/my', auth, async (req, res) => {
  try {
    const inquiries = await Adoption.find({ familyId: req.user._id })
      .populate({
        path: 'childId',
        select: 'firstName age photo gender story',
        populate: { path: 'orphanageId', select: 'name city' }
      })
      .sort({ appliedDate: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error("Fetch User Adoptions Error:", error);
    res.status(500).json({ error: "Failed to load adoption status tracker." });
  }
});

// @route   GET /api/adoptions/orphanage/:id
// @desc    Retrieve adoption inquiries for children in an orphanage (Orphanage Admins only)
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

    const inquiries = await Adoption.find()
      .populate('familyId', 'name email phone photo address')
      .populate({
        path: 'childId',
        match: { orphanageId: req.params.id },
        select: 'firstName age gender photo story'
      })
      .sort({ appliedDate: -1 });

    // Filter out inquiries that do not belong to children in this orphanage
    const filteredInquiries = inquiries.filter(inq => inq.childId !== null);

    res.json(filteredInquiries);
  } catch (error) {
    console.error("Fetch Orphanage Adoptions Error:", error);
    res.status(500).json({ error: "Failed to load adoption inquiries." });
  }
});

// @route   PUT /api/adoptions/:id/status
// @desc    Update status of adoption inquiry (Orphanage Admins only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const adoption = await Adoption.findById(req.params.id)
      .populate('familyId', 'name email')
      .populate('childId', 'firstName orphanageId');
      
    if (!adoption) {
      return res.status(404).json({ error: "Adoption record not found." });
    }

    const orphanage = await Orphanage.findById(adoption.childId.orphanageId);
    
    // Verify admin owns this orphanage
    const isOwner = orphanage.adminId.toString() === req.user._id.toString();
    const isSuper = req.user.role === 'superAdmin';
    if (!isOwner && !isSuper) {
      return res.status(403).json({ error: "Unauthorized update request." });
    }

    adoption.status = status;
    if (notes) adoption.notes = notes;
    await adoption.save();

    // Sync child status based on approval
    const child = await Child.findById(adoption.childId._id);
    if (status === 'approved') {
      child.adoptionStatus = 'adopted';
      await child.save();
    } else if (status === 'rejected') {
      child.adoptionStatus = 'available';
      await child.save();
    }

    // Email status update to family
    await sendEmail({
      to: adoption.familyId.email,
      subject: `HopeNest - Adoption Application Update: ${status.toUpperCase()}`,
      text: `Dear ${adoption.familyId.name},\n\n` +
        `Your application to adopt ${adoption.childId.firstName} has been updated to: ${status.toUpperCase()}.\n` +
        `${notes ? `Orphanage Update Note: "${notes}"\n` : ''}\n` +
        `Please log in to your dashboard to review next steps.\n\n` +
        `With warm regards,\n` +
        `The HopeNest Team`
    });

    res.json(adoption);
  } catch (error) {
    console.error("Update Adoption Error:", error);
    res.status(500).json({ error: "Failed to update adoption status." });
  }
});

module.exports = router;
