const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orphanageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orphanage',
    required: true
  },
  type: {
    type: String,
    enum: ['money', 'food', 'clothes', 'books'],
    required: true
  },
  amount: {
    type: Number,
    default: 0 // Used only if type is 'money'
  },
  quantity: {
    type: String,
    default: '' // Used for items e.g., "5 boxes", "20 packets"
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'received'],
    default: 'received' // default to received for demo/stripe simplicity
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', DonationSchema);
