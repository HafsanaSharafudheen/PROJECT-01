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

router.post('/addNewOffer',  upload.single("bannerImage"), jwtVerifyModule.JWTVerify,async(req,res)=>{
     console.log(req.body,'reqbody')
     console.log(req.files,'----------------',req.file)
     offerController.addNewOffer(req,res);
 })
 router.post('/getOfferDetails', async (req, res) => {
    try {
        const allOffers = await Offer.find({ "_id": req.body._id }); // Use req.query instead of req.body for a GET request

        return res.status(200).json({ message: 'Successfully fetched data', data: allOffers });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});
 
module.exports=router;