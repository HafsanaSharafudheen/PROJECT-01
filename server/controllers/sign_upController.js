const otpController=require('./otpController')

const User = require('../models/userdb');
const OTP=require('../models/otpcollection')
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
          var otp = await otpController.SendOTPVerificationEmail(req.body.email);
         

          if(otp){
            
            
            const dbOTP = new OTP({
              "otp":otp,
              "email":req.body.email,
              "OTPType":"email",
              "date":new Date()
            });
      
            await dbOTP.save();

              return res.status(200).json({ message: 'OTP Sent to your email' })
           

          } else {
            return res.status(400).json({ message: 'OTP creation failed' });
          }
      }
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'User creation failed' });
    }
    
  }











   


module.exports={
  
    signupVerification:signupVerification
  }