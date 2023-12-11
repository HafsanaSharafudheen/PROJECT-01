const Coupons=require('../models/coupons')


async function getCopouns(req,res){
    console.log('gercoupopns')
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

async function addNewCoupons(req, res) {
    console.log('addnewcoupopuns 1',req.body.discountType)
    try {
        const newCoupon = new Coupons({
            couponCode: req.body.couponCode,
            discountType: req.body.discountType,
            discountAmount: req.body.discountAmount,
            expiryDate: req.body.expiryDate,
        });

        await newCoupon.save();
        console.log('addnewcoupopuns 2')

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
console.log(req.body,'applycoupoun start ')
        // Find the coupon by code
        const currentDate = new Date();

        const coupon = await Coupons.findOne({
          expiryDate: { $gt: currentDate }
        });        

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found or expired' });
        }
console.log(coupon,'-----------coupon')
        let discountedAmount;

        // Check the discount type and calculate the discounted amount
        if (coupon.discountType === 'Percentage') {
            discountedAmount = parseFloat(coupon.discountAmount / 100) * req.body.amount;
        } else if (coupon.discountType === 'fixed') {
            discountedAmount = coupon.discountAmount;
        }

        // Calculate the updated total amount after applying the discount
        const updatedAmount = parseFloat(req.body.amount- discountedAmount);
console.log(updatedAmount,'-----------------------')
        // Update the response with the discounted amount and updated total amount
        return res.status(200).json({
            coupon: coupon,
            discountedAmount: discountedAmount,
            updatedAmount: updatedAmount
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    getCopouns:getCopouns,
    addNewCoupons:addNewCoupons,
    applyCoupon:applyCoupon,
  }