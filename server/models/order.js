const mongoose = require('mongoose');


const orderProductSchema = new mongoose.Schema({
    amount: Number,
    product_id: String,
    orderStatus: String,
    DeliveryDate: Date,
    deliveryStatus: String,
    canecelled: Boolean,
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
    orderProducts: [orderProductSchema]


});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
