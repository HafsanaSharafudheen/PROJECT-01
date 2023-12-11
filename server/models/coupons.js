const mongoose = require('mongoose');

const couponsSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now, 
    required: true,
  },
  discountType: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0, // Default value is set to 0, modify as needed
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

const Coupons = mongoose.model('Coupons', couponsSchema);

module.exports = Coupons;
