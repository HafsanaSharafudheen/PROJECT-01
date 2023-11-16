const express=require('express');
var router = express.Router();
const loginController=require('../controllers/loginController');
const otpController = require('../controllers/otpController');

router.get('/',(req, res)=> {
   res.render('userlogin');
 });

router.post('/sent-otp',(req,res)=>{
 loginController.loginSendOTP(req,res);
})

router.post('/verify-otp', (req, res) => {
    
  otpController.OTPVerificationEmail(req, res,userLogin)
  function userLogin(){
        loginController.userVerification(req,res)
  }

})


module.exports=router;