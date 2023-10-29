const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    otp: {
        type: String, // This field will store the OTP value
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: /^\S+@\S+\.\S+$/
    },
    phone: {
        type: String,

    },
    OTPType: {
        type: String,
        required: true,
    },

    date: {
        type: Date,
        required: true,
    }
}, {
    collection: "OTP"
});

module.exports = mongoose.model('OTP', OTPSchema)
