const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAmount: {
    type: Number,
    default: 0
  },
  transaction: {
    type: String,
    required: true
  },
  transactionDescription: {
    type: String
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
});

// Create the Wallet model
const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;