const express = require('express');
const router = express.Router();
const jwtVerifyModule = require('../middileware/JWTverify')
const User=require('../models/userdb');
const upload = require('../middileware/fileUploader')
const Address=require('../models/address')
// const Coupons=require('../models/coupons')
router.get('/', jwtVerifyModule.JWTVerify,async (req,res)=>{
  
    const user = await User.findOne({"_id": req.userDetails.user_id});
    const addressList = await Address.find({
        "user_id": req.userDetails.user_id
      })  
     
    if (!user) {
        return res.status(404).send('User not found');
      }

res.render('profile',{user:user,addressList:addressList})
})
router.post('/updateProfile', upload.single('photos'), jwtVerifyModule.JWTVerify,async (req,res)=>{

    try{
if(req.file){

    const updatedUser = await User.findOneAndUpdate(
        {"_id":req.userDetails.user_id},
        { $set: { "fullName":req.body.fullName,"profileImage":req.file.filename} },
       
      );
}
     else{
        const updatedUserName = await User.findOneAndUpdate(
            {"_id":req.userDetails.user_id},
            { $set: { "fullName":req.body.fullName} },
           
          );

     } 
          res.redirect('/profile');
    }
    catch{

    }
})











module.exports = router;