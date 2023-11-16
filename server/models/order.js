const mongoose = require('mongoose');


const orderProductSchema = new mongoose.Schema({
   amount:Number,
product_id:String
});

const orderSchema = new mongoose.Schema({
  
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    paymentMethod: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    cancelled: {
        type: Boolean,
        default: false
    },

    orderStatus: {
        type: String,
        default: "pending"
    },
    deliveryStatus: {
        type: String,
        default: "pending"
    },
    orderProducts: [orderProductSchema]


});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
