const Coupons = require('../models/coupons');
//to show the  coupouns page.take all the  coupons from the db.
async function getCouponsPage(req, res) {
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
}
//take the coupon depend on the req body id.
async function getCopouns(req, res) {
  try {
    const coupons = await Coupons.findOne({
      "_id": req.body._id
    });
    if (!coupons) {
      return res.status(400).json({
        message: "No Coupons available"
      });
    } else {
      return res.status(200).json({
        data: coupons
      });
    }
  } catch (error) {
    console.error('Error while fetching coupons:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
//adding new coupon and save it in the  db
async function addNewCoupons(req, res) {
  try {
    const newCoupon = new Coupons({
      couponCode: req.body.couponCode,
      discountType: req.body.discountType,
      discountAmount: req.body.discountAmount,
      expiryDate: req.body.expiryDate
    });
    await newCoupon.save();
    return res.status(200).json({
      message: 'Coupon added successfully'
    });
  } catch (error) {
    console.error('Error while adding Coupon:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function applyCoupon(req, res) {
  try {
    const currentDate = new Date();
    const coupon = await Coupons.findOne({
      expiryDate: {
        $gt: currentDate
      }
    });
    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found or expired'
      });
    }
    let discountedAmount;

    // Check the discount type and calculate the discounted amount
    if (coupon.discountType === 'Percentage') {
      discountedAmount = parseFloat(coupon.discountAmount / 100) * req.body.amount;
    } else if (coupon.discountType === 'fixed') {
      discountedAmount = coupon.discountAmount;
    }

    // Calculate the updated total amount after applying the discount
    const updatedAmount = parseFloat(req.body.amount - discountedAmount);
    // Update the response with the discounted amount and updated total amount
    return res.status(200).json({
      coupon: coupon,
      discountedAmount: discountedAmount,
      updatedAmount: updatedAmount
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function deleteCoupons(req, res) {
  try {
    const CoupounExist = await Coupons.findOne({
      '_id': req.query._id
    });
    if (!CoupounExist) {
      return res.status(400).json({
        message: 'no such coupon avialable'
      });
    } else {
      const updatedCoupons = await Coupons.updateOne({
        '_id': req.query._id
      }, {
        $set: {
          deleted: true
        }
      });
      res.redirect('/coupons');
    }
  } catch (error) {
    console.error('Errorwhile deleting products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function editCoupon(req, res) {
  try {
    const updatedCoupons = await Coupons.findOne({
      '_id': req.body._id
    });
    console.log('1111');
    if (!updatedCoupons) {
      return res.status(400).json({
        message: 'no such Coupons avialable'
      });
    } else {
      const result = await Coupons.updateOne({
        _id: req.body._id
      }, {
        $set: {
          couponCode: req.body.couponCode,
          discountType: req.body.discountType,
          discountAmount: req.body.discountAmount,
          expiryDate: req.body.expiryDate,
          date: new Date()
        }
      });
      console.log('11111');
      console.log('Coupons updated successfully');
      res.status(200).json({
        message: 'Coupons updated successfully'
      });
    }
  } catch (error) {
    console.error('Errorwhile adding Coupons:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
module.exports = {
  getCouponsPage: getCouponsPage,
  getCopouns: getCopouns,
  addNewCoupons: addNewCoupons,
  applyCoupon: applyCoupon,
  deleteCoupons: deleteCoupons,
  editCoupon: editCoupon
};