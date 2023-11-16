const express = require('express');
const router = express.Router();
const jwtVerifyModule = require('../middileware/JWTverify')
const User=require('../models/userdb')

router.get('/', jwtVerifyModule.JWTVerify,async (req,res)=>{
  
    const user = await User.findOne(req.userDetails.id);
    if (!user) {
        return res.status(404).send('User not found');
      }

res.render('profile',{user:user})
})
router.post('/updateProfile', jwtVerifyModule.JWTVerify,async (req,res)=>{
    try{

        const updatedUser = await User.findOneAndUpdate(
            req.userDetails.id,
            { $set: { "fullName":req.body.name, "email":req.body.email } },
           
          );
      
          res.redirect('/profile');
    }
    catch{

    }
})











module.exports = router;