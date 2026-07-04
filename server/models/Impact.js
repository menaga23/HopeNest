const mongoose = require('mongoose');

const ImpactSchema = new mongoose.Schema({
  totalMeals: {
    type: Number,
    default: 0
  },
  totalVolunteers: {
    type: Number,
    default: 0
  },
  totalFunds: {
    type: Number,
    default: 0
  },
  totalSponsored: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Impact', ImpactSchema);
