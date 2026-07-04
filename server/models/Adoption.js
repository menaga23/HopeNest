const mongoose = require('mongoose');

const AdoptionSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  familyDetails: {
    maritalStatus: { type: String, required: true },
    annualIncome: { type: Number, required: true },
    employment: { type: String, required: true },
    homeType: { type: String, required: true },
    hasChildren: { type: Boolean, default: false },
    motivation: { type: String, required: true }
  },
  familyPhoto: {
    type: String,
    default: '' // File path or Cloudinary URL
  },
  status: {
    type: String,
    enum: ['applied', 'review', 'interview', 'approved', 'rejected'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: '' // admin notes
  }
});

module.exports = mongoose.model('Adoption', AdoptionSchema);
