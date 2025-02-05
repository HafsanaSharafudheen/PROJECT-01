const jwt = require('jsonwebtoken');
const user = require('../models/userdb');
const otpController = require('./otpController');
const OTP = require('../models/otpcollection');
const bcrypt = require('bcrypt');
async function loginSendOTP(req, res) {
  try {
    console.log('senting 1');
    const existingUser = await user.findOne({
      email: req.body.email
    });
    if (existingUser) {
      if (existingUser.isBlocked) {
        return res.status(401).json({
          message: 'User is blocked'
        });
      }
      console.log(existingUser);
      const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password);
      console.log(passwordMatch);
      if (passwordMatch) {
        await OTP.deleteMany({
          email: req.body.email
        });
        var otp = await otpController.SendOTPVerificationEmail(req.body.email);
        console.log(otp);
        if (otp) {
          const dbOTP = new OTP({
            "otp": otp,
            "password": req.body.password,
            "email": req.body.email,
            "OTPType": "email",
            "date": new Date()
          });
          await dbOTP.save();
          return res.status(200).json({
            message: 'OTP Sent to your email'
          });
        }
      } else {
        return res.status(401).json({
          message: 'incorrect password'
        });
      }
    } else {
      return res.status(401).json({
        message: 'User Not Found'
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'User authentication failed'
    });
  }
}
async function userVerification(req, res) {
  try {
    const existingUser = await user.findOne({
      "email": req.body.email
    });
    if (existingUser) {
      const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password);
      if (passwordMatch) {
        const token = jwt.sign({
          user_id: existingUser._id,
          email: existingUser.email
        }, process.env.JWTKEY, {
          expiresIn: '24h'
        });
        //for saving token to the client side
        res.cookie('token', token, {
          httpOnly: true
          //          secure: true
        });

        // Return the token to the client for authentication
        return res.status(200).json({
          message: 'User authenticated'
          // token: token,
        });
      }

      // Create a JWT token for the user
      else {
        return res.status(401).json({
          message: 'please check your password'
        });
      }
    } else {
      return res.status(401).json({
        message: 'User Not Found'
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'User authentication failed'
    });
  }
}
module.exports = {
  userVerification: userVerification,
  loginSendOTP: loginSendOTP
};