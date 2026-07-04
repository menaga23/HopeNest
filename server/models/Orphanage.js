const mongoose = require('mongoose');

const OrphanageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  photos: [{
    type: String // Cloudinary URLs or local fallback path
  }],
  needs: [{
    item: { type: String, required: true },
    quantity: { type: String, required: true }, // e.g. "50 kg", "10 units"
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  }],
  capacity: {
    type: Number,
    required: true
  },
  currentChildren: {
    type: Number,
    default: 0
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false // Super admin approval required
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Orphanage', OrphanageSchema);
