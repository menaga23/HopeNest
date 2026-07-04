const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  photo: {
    type: String,
    required: true // Cloudinary URL or local path
  },
  story: {
    type: String,
    required: true
  },
  orphanageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orphanage',
    required: true
  },
  sponsorStatus: {
    type: String,
    enum: ['available', 'sponsored'],
    default: 'available'
  },
  adoptionStatus: {
    type: String,
    enum: ['available', 'inquired', 'adopted'],
    default: 'available'
  },
  sponsoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // links to the user who sponsored them
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Child', ChildSchema);
