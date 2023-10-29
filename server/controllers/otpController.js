require('dotenv').config();
const User = require('../models/userdb');
const OTPSchema = require('../models/otpcollection');


async function SendOTPVerificationEmail(toEmail) {


    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, // Gmail SMTP port for TLS
        secure: false, // Use TLS, not SSL
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    console.log(process.env.SMTP_USERNAME);
    console.log(process.env.SMTP_PASSWORD);
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
        from: process.env.SMTP_USERNAME + "@gmail.com",
        to: toEmail,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`,
    };
    try {
        console.log(mailOptions);
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return otp;
    } catch (error) {
        console.error('Error sending email: ' + error);
        return 0;
    }

};

async function OTPVerificationEmail(req, res) {
    const userOTP = req.body.otp;
    const dbOTP = await OTPSchema.findOne({
        "email": req.body.email
    })
    const otpExpiration = dbOTP.date+ 60 * 1000

    if (!dbOTP || Date.now() > otpExpiration) {
        res.status(401).json({
            message: 'OTP has expired'
        });

    } else if (userOTP === dbOTP.otp) {
        const newUser = new User({
            "fullName": req.body.fullName,
            "email": req.body.email,
            "admin": false,
          "otp":userOTP,
            "date": new Date()
        });
        
        await newUser.save();
        return res.status(200).json({ message: 'OTP comparison done' })
     
    } else {
        return res.status(401).json({
            message: 'Invalid OTP'
        });
    }
    
}


module.exports = {
    SendOTPVerificationEmail: SendOTPVerificationEmail,
    OTPVerificationEmail: OTPVerificationEmail,
}