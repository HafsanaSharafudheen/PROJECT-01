const mongoose = require('mongoose');


const orderProductSchema = new mongoose.Schema({
    amount: Number,
    product_id: String,
    orderStatus: String,
    DeliveryDate: Date,
    deliveryStatus: String,
    cancelled: Boolean,
    stock:Number
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
    deleted:{
        type:String,
        default:false,
    },
    coupounCode:{
        type:String
        
    },
    wallet_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
    },
    orderProducts: [orderProductSchema],
    orderCreatedByRazorPay: {
        type: Object
    },

});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
