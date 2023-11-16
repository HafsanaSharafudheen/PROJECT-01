const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cartCount: {
    type: Number,    
    default: 0, 
},date: {
    type: Date,
    required: true,
},  
deleted: { type: Boolean,
    default: false}, 


});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
