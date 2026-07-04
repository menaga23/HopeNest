const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Orphanage = require('../models/Orphanage');
const Impact = require('../models/Impact');
const { auth, requireRole } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/donations
// @desc    Submit a new donation (money or items) and update impact stats
router.post('/', auth, async (req, res) => {
  try {
    const { orphanageId, type, amount, quantity, message } = req.body;

    const orphanage = await Orphanage.findById(orphanageId);
    if (!orphanage) {
      return res.status(404).json({ error: "Orphanage not found." });
    }

    // Create donation
    const donation = new Donation({
      donorId: req.user._id,
      orphanageId,
      type,
      amount: type === 'money' ? parseFloat(amount) : 0,
      quantity: type !== 'money' ? quantity : '',
      message: message || '',
      status: 'received'
    });

    await donation.save();

    // Dynamically update Impact metrics
    let impact = await Impact.findOne({});
    if (!impact) {
      impact = new Impact({ totalMeals: 0, totalVolunteers: 0, totalFunds: 0, totalSponsored: 0 });
    }

    if (type === 'money') {
      impact.totalFunds += parseFloat(amount);
    } else if (type === 'food') {
      // Estimate meals: e.g. parse quantity number or default to 20 meals
      const qtyNumber = parseInt(quantity) || 1;
      impact.totalMeals += qtyNumber * 10;
    }
    impact.lastUpdated = new Date();
    await impact.save();

    // Trigger Socket.io realtime notification
    const io = req.app.get('io');
    if (io) {
      io.emit('newActivity', {
        type: 'donation',
        donorName: req.user.name,
        donationType: type,
        amount: type === 'money' ? parseFloat(amount) : null,
        quantity: type !== 'money' ? quantity : null,
        orphanageName: orphanage.name,
        date: new Date()
      });
    }

    // Send confirmation email
    const emailSubject = `HopeNest - Thank you for your support!`;
    const emailText = `Dear ${req.user.name},\n\n` +
      `Thank you so much for your generous donation to ${orphanage.name}!\n` +
      `Details:\n` +
      `- Type: ${type.toUpperCase()}\n` +
      `${type === 'money' ? `- Amount: ₹${amount}` : `- Quantity: ${quantity}`}\n` +
      `${message ? `- Message: "${message}"` : ''}\n\n` +
      `Your kindness brings hope to children in need. You can view your receipt in your dashboard.\n\n` +
      `Warmly,\n` +
      `The HopeNest Team`;

    await sendEmail({
      to: req.user.email,
      subject: emailSubject,
      text: emailText
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error("Post Donation Error:", error);
    res.status(500).json({ error: "Failed to submit donation." });
  }
});

// @route   GET /api/donations/my
// @desc    Retrieve logged-in user's donation history
router.get('/my', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate('orphanageId', 'name city')
      .sort({ date: -1 });
    res.json(donations);
  } catch (error) {
    console.error("Fetch User Donations Error:", error);
    res.status(500).json({ error: "Failed to fetch your donation history." });
  }
});

// @route   GET /api/donations/orphanage/:id
// @desc    Retrieve all incoming donations for an orphanage (Orphanage Admins only)
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

    const donations = await Donation.find({ orphanageId: req.params.id })
      .populate('donorId', 'name email phone')
      .sort({ date: -1 });

    res.json(donations);
  } catch (error) {
    console.error("Fetch Orphanage Donations Error:", error);
    res.status(500).json({ error: "Failed to load orphanage donations." });
  }
});

module.exports = router;
