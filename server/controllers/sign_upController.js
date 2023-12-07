const otpController = require('./otpController')

const User = require('../models/userdb');
const OTP = require('../models/otpcollection')
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
    } 
    
    else {

      const deleteUser = await OTP.deleteMany({
        email: req.body.email
      })


      var otp = await otpController.SendOTPVerificationEmail(req.body.email);
      const hashedPassword = await bcrypt.hash(req.body.password, 10)

      if (otp) {

        const dbOTP = new OTP({
          "'password":hashedPassword,
          "otp": otp,
          "number":req.body.number,
          "email": req.body.email,
          "OTPType": "email",
          "date": new Date()
        });

        await dbOTP.save();

        return res.status(200).json({
          message: 'OTP Sent to your email'
        })
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
async function insertUser(req,res){
  const hashedPassword = await bcrypt.hash(req.body.password, 10)

  const newUser = new User({

      "fullName": req.body.fullName,
      "password": hashedPassword,
      "number":req.body.number,

      "email": req.body.email,
      "admin": false,
      "date": new Date()
  });
  await newUser.save();
  return res.status(200).json({ message: 'OTP comparison done' })


}
module.exports = {
  insertUser:insertUser,
  signupVerification: signupVerification
}