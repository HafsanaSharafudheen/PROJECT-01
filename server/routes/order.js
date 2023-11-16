const express = require('express');
const router = express.Router();
const Order=require('../models/order');
const Address=require('../models/address')
const jwtVerifyModule = require('../middileware/JWTverify')


router.post('/addressPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  console.log("body------------------------",req.body)
  const addressList = await Address.find({
    "user_id": req.userDetails.user_id
  })  
  return res.render('addressPage', {
    addressList: addressList,
    summary: req.body
  })

})
  router.get('/newAddressPage',jwtVerifyModule.JWTVerify,(req,res)=>{
      console.log(req.body,"starting newaddress")
      res.render('newAddressPage')
  })

  router.post('/saveAddress', jwtVerifyModule.JWTVerify,async(req,res)=>{
    try {
    
        const newAddress = new Address({
            fullName:req.body.fullName,
            address:req.body.address,
            state:req.body.state,
            city:req.body.city,
            landmark:req.body.landmark,
            mobile:req.body.mobile,
            pincode:req.body.pincode,
            user_id:req.userDetails.user_id,

        });
    
        await newAddress.save();
    res.redirect('/order/addressPage')
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  })
  
  router.post('/orderConfirmation',jwtVerifyModule.JWTVerify,async (req,res)=>{
    try {
      const order = new Order({
       
        user_id: req.body.user_id,
            address_id: req.body.address_id,
            paymentMethod: req.body.paymentMethod,
            date: new Date(),

      });
  
      const savedOrder = await order.save();
  
      res.render("orderConfirmationPage")
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  module.exports=router;