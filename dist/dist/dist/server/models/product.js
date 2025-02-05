const mongoose = require('mongoose');
const productImageSchema = new mongoose.Schema({
  imageName: String,
  imageUrl: String
});
const productSchema = new mongoose.Schema({
  productNumber: {
    type: Number,
    unique: true,
    default: 1 // Set an initial value, e.g., 1
  },
  productName: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Check if the value is a string and not a number
        return isNaN(value);
      },
      message: 'Product name must be a string and not a number.'
    }
  },
  productCategory: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  productCoupon: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  productDescription: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'offer'
  },
  deleted: {
    type: Boolean,
    default: false
  },
  productImages: [productImageSchema]
});
module.exports = mongoose.model('product', productSchema);