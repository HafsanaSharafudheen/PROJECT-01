const express=require('express');
const router=express.Router();
const Offer=require('../models/offer');
const upload=require('../middileware/fileUploader');
const jwtVerifyModule = require('../middileware/JWTverify');

const offerController=require('../controllers/offerController');
router.get('/',async(req,res)=>{
    try {
        const offers = await Offer.find({});
    
        res.render('offerPage', {
            offers: offers
        });
    
      } catch (error) {
        console.error('Error while fetching offers:', error);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
    });

router.post('/addNewOffer',  upload.single("photos"), jwtVerifyModule.JWTVerify,async(req,res)=>{
    
    if (req.body._id) {
        offerController.editOffer(req, res)
      } else {
        offerController.addNewOffer(req, res)
      } })

 router.post('/getOfferDetails', async (req, res) => {
    try {
        const offer = await Offer.findOne({
          "_id": req.body._id
        });
    
        if (!offer) {
          return res.status(400).json({
            message: "No offer available"
          });
        } else {
          return res.status(200).json({
            data: offer
          });
        }
      } catch (error) {
        console.error('Error while fetching offer:', error);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
    });
 
router.get('/deleteOffer',jwtVerifyModule.JWTVerify,  (req, res) => {
    offerController.deleteOffer(req, res)
  })

  
  module.exports=router;