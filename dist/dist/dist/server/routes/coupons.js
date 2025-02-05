const express = require('express');
const router = express.Router();
const couponsController = require('../controllers/couponsController');
const Coupons = require('../models/coupons');
router.get('/', async (req, res) => {
  couponsController.getCouponsPage(req, res);
});
router.post('/getCouoponsByCouponId', (req, res) => {
  couponsController.getCopouns(req, res);
});
router.post('/addCoupons', (req, res) => {
  if (req.body._id) {
    couponsController.editCoupon(req, res);
  } else {
    couponsController.addNewCoupons(req, res);
  }
});
router.get('/viewCoupons', async (req, res) => {
  const currentDate = new Date();
  const validCoupons = await Coupons.find({
    expiryDate: {
      $gt: currentDate
    }
  });
  res.render('viewCouponsPage', {
    validCoupons: validCoupons
  });
});
router.post('/applyCoupon', (req, res) => {
  couponsController.applyCoupon(req, res);
});
router.get('/deleteCoupons', (req, res) => {
  couponsController.deleteCoupons(req, res);
});
module.exports = router;