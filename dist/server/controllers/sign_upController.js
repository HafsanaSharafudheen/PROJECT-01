const otpController = require('./otpController');
const jwt = require('jsonwebtoken');
const Wallet = require('../models/wallet');
const User = require('../models/userdb');
const OTP = require('../models/otpcollection');
const bcrypt = require('bcrypt');

//signupverification
async function signupVerification(req, res) {
  try {
    // Check if a user with the same Email already exists
    const existingUser = await User.findOne({
      email: req.body.email
    });
    if (existingUser) {
      // User with the same Email already exists
      return res.status(400).json({
        message: 'Email already in use'
      });
    } else {
      const deleteUser = await OTP.deleteMany({
        email: req.body.email
      });
      var otp = await otpController.SendOTPVerificationEmail(req.body.email);
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      if (otp) {
        const dbOTP = new OTP({
          "password": hashedPassword,
          "otp": otp,
          "number": req.body.number,
          "email": req.body.email,
          "OTPType": "email",
          "date": new Date()
        });
        await dbOTP.save();
        return res.status(200).json({
          message: 'OTP Sent to your email'
        });
      } else {
        return res.status(400).json({
          message: 'OTP creation failed'
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: 'User creation failed'
    });
  }
}
async function insertUser(req, res) {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  //create a referral code for the user before saving the details into the db.
  // Function to generate a referral code
  function generateReferralCode() {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
  }

  // Call the function to get the generated referral code
  const userReferralCode = generateReferralCode();
  // Assuming you have a User model and you want to create a new user
  const newUser = new User({
    "fullName": req.body.fullName,
    "password": hashedPassword,
    "number": req.body.number,
    "email": req.body.email,
    "admin": false,
    "date": new Date(),
    "referralCode": userReferralCode,
    "refferalCodeByUser": req.body.refferalCodeByUser
  });

  // Save the newUser to the database

  await newUser.save();
  console.log(req.body, '000000000000000000000000000000000000000000000');
  // Assuming referralCodeByUser is the code provided by the current user
  const users = await User.find({});
  const referralCodeByUser = req.body.refferalCodeByUser; // Assuming this is provided dynamically

  // Find a user with the provided referral code
  const matchedUser = users.find(user => user.referralCode === referralCodeByUser);
  console.log(matchedUser, "mmmmmmmmmmmmmmmmmmmmmm");
  if (matchedUser) {
    const newWallet = new Wallet({
      user_id: matchedUser._id,
      walletAmount: 200,
      transaction: "credit",
      transactionDescription: "Using Your Refferal code",
      transactionDate: Date.now()
    });
    await newWallet.save();
  }
  const existingUser = await User.findOne({
    "email": req.body.email
  });
  if (existingUser) {
    // Create a new token for the found user
    const token = jwt.sign({
      user_id: existingUser._id,
      email: existingUser.email
    }, process.env.JWTKEY, {
      expiresIn: '24h'
    });
    // Send the new token to the client
    res.cookie('token', token, {
      httpOnly: true,
      secure: true
    });
    return res.status(200).json({
      message: 'OTP comparison done'
    });
  }
}
module.exports = {
  insertUser: insertUser,
  signupVerification: signupVerification
};