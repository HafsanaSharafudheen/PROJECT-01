const express = require('express');
const router = express.Router();
const Offer = require('../models/offer');
const upload = require('../middileware/fileUploader');
const jwtVerifyModule = require('../middileware/JWTverify');
const offerController = require('../controllers/offerController');
router.get('/', async (req, res) => {
  offerController.showAllOfferDetails(req, res);
});
router.post('/addNewOffer', upload.single("photos"), jwtVerifyModule.JWTVerify, async (req, res) => {
  if (req.body._id) {
    offerController.editOffer(req, res);
  } else {
    offerController.addNewOffer(req, res);
  }
});
router.post('/getOfferDetails', async (req, res) => {
  offerController.getAllOfferDetails(req, res);
});
router.get('/deleteOffer', jwtVerifyModule.JWTVerify, (req, res) => {
  offerController.deleteOffer(req, res);
});
module.exports = router;