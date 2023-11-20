const mongoose = require('mongoose');

const WishListSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    required: true,
},

deleted: { type: Boolean,
  default: false}, 

});

module.exports= mongoose.model('Wish', WishListSchema);

