const express = require('express');
const router = express.Router();
const jwtVerifyModule = require('../middileware/JWTverify')
const footerController=require('../controllers/footer/footerController')
router.get('/about',jwtVerifyModule.JWTVerify,(req, res)=>{
    res.render('about');
})
router.get('/deliveryInfo',jwtVerifyModule.JWTVerify,(req, res)=>{
    res.render('deliveryInfo')
})
router.get('/contact',jwtVerifyModule.JWTVerify,(req, res)=>{
    res.render('contactUs')
})
router.post('/submitForm',jwtVerifyModule.JWTVerify,(req, res)=>{
    console.log(req.body,'iiiiiiiiiiiiiiiiiiiiiii');
    footerController.messageSending(req,res);
})
module.exports = router;