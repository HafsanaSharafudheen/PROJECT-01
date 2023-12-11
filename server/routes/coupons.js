const express=require('express');
const router=express.Router();
const couponsController=require('../controllers/couponsController')
const Coupons=require('../models/coupons')
router.get('/',async(req,res)=>{
    try {

        const coupons = await Coupons.find({});
       
          res.render('couponsPage', {
            coupons: coupons
          
          });
        
      } catch (error) {
        console.error('Error while fetching coupons:', error);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
})
router.post('/getCouoponsByCouponId',(req,res)=>{
    couponsController.getCopouns(req,res);
})
router.post('/addCoupons',(req,res)=>{
    console.log('addcounposn strattttt',req.body)
couponsController.addNewCoupons(req,res)
})
router.get('/viewCoupons',async (req,res)=>{
     const currentDate = new Date();
      const validCoupons = await Coupons.find({ expiryDate: { $gt: currentDate } });

    res.render('viewCouponsPage',{validCoupons:validCoupons})
})
router.post('/applyCoupon',(req,res)=>{
    couponsController.applyCoupon(req,res);
})
module.exports=router;
