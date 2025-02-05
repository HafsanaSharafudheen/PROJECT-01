const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Razorpay = require('razorpay');
const User = require('../models/userdb');
const Cart = require('../models/Cart');
const Order = require('../models/order');
const Address = require('../models/address');
const jwtVerifyModule = require('../middileware/JWTverify');
const {
  ObjectId
} = require('mongodb');
const Offer = require('../models/offer');
const Coupons = require('../models/coupons');
const Wallet = require('../models/wallet');
const orderController = require('../controllers/orderController');
const walletServices = require('../services/walletServices');
require('dotenv').config();
router.post('/addressPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  const addressList = await Address.find({
    "user_id": req.userDetails.user_id
  });
  debugger;
  return res.render('checkOut', {
    addressList: addressList,
    summary: req.body,
    RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY
  });
});
router.post('/saveAddress', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    const newAddress = new Address({
      fullName: req.body.fullName,
      address: req.body.address,
      state: req.body.state,
      city: req.body.city,
      landmark: req.body.landmark,
      mobile: req.body.mobile,
      pincode: req.body.pincode,
      user_id: req.userDetails.user_id
    });
    await newAddress.save();
    return res.status(200).json({
      message: "Success"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});
router.post('/orderConfirmation', jwtVerifyModule.JWTVerify, async (req, res) => {
  if (req.body.paymentMethod === "CASH ON DELIVERY") {
    OrderSave(req, res, null, null);
    return;
  } else if (req.body.paymentMethod === "WALLET") {
    const userId = req.userDetails.user_id;
    const desiredAmount = req.body.amount;
    const walletId = await isWalletBalanceSufficient(userId, desiredAmount);
    if (walletId) {
      OrderSave(req, res, null, walletId);
      return;
    }
  } else {
    try {
      // create order in razorpay 

      const Razorpay = require('razorpay');
      var instance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_API_SECRET_KEY
      });
      var options = {
        amount: parseFloat(req.body.amount) * 100,
        currency: "INR",
        receipt: "order_rcptid_11"
      };
      console.log("Options ", options);
      instance.orders.create(options, function (err, order) {
        console.log("Create Order", order);
        if (order) {
          OrderSave(req, res, order, null);
        } else {
          console.log(err);
          res.status(500).json({
            error: err ? err.statusCode + " " + err.error.description : 'Internal server error'
          });
        }
      });
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
});
async function isWalletBalanceSufficient(userId, desiredAmount) {
  const totalWalletAmount = await walletServices.calculateWalletSum(userId);
  if (totalWalletAmount >= desiredAmount) {
    const newWallet = new Wallet({
      user_id: userId,
      walletAmount: 0 - desiredAmount,
      // if desiredAmount is 150 then need to save -150. 0-150=-150

      transaction: "debit",
      transactionDescription: "Purchase",
      transactionDate: Date.now()
    });
    const savedWallet = await newWallet.save();
    return savedWallet._id;
  }
  return 0;
}
async function calculateWalletSum(userId) {
  try {
    const walletSumResult = await Wallet.aggregate([{
      $match: {
        user_id: userId
      }
    }, {
      $group: {
        _id: "$user_id",
        totalWalletAmount: {
          $sum: '$walletAmount'
        }
      }
    }]);
    if (walletSumResult.length > 0) {
      const totalWalletAmount = walletSumResult[0].totalWalletAmount;
      console.log(`Total Wallet Amount for user ${userId}: ${totalWalletAmount}`);
      return totalWalletAmount;
    } else {
      console.log(`No wallet records found for user ${userId}`);
      return 0; // or any default value if there are no wallet records
    }
  } catch (error) {
    console.error('Error calculating wallet sum:', error);
    throw error;
  }
}
async function OrderSave(req, res, razorObj, walletId) {
  const cartItems = await Cart.find({
    "user_id": req.userDetails.user_id,
    "deleted": {
      $ne: true
    }
  });
  const productIds = cartItems.map(x => {
    return x.product_id;
  });
  // Use the productIds to fetch product details

  var products = await Product.find({
    "_id": {
      $in: productIds
    }
  });
  let productsArray = [];
  for (let i = 0; i < products.length; i++) {
    const cartOfProduct = cartItems.find(x => x.product_id.equals(products[i]._id));
    const offer = await Offer.findOne({
      _id: products[i].offer_id
    });
    if (offer) {
      if (offer.offerType.toLowerCase() === 'percentage') {
        products[i].discountedAmount = offer.DiscountValue / 100 * products[i].productPrice;
      } else if (offer.offerType === 'Amount') {
        products[i].discountedAmount = products[i].productPrice - offer.DiscountValue;
      }
    }
    if (cartOfProduct) {
      for (let j = 0; j < cartOfProduct.cartCount; j++) {
        productsArray.push(products[i]);
      }
    }
  }
  let discountedCouponAmount = 0;
  const couponData = await Coupons.findOne({
    couponCode: req.body.coupounCode
  });
  if (couponData && couponData.discountType.toLowerCase() === 'percentage') {
    discountedCouponAmount = amount * couponData.discountAmount / 100;
  } else if (couponData && couponData.discountType.toLowerCase() === 'fixed') {
    discountedCouponAmount = couponData.discountAmount;
  }
  const productDetails = productsArray.map(x => {
    const amountAfterDiscount = x.discountedAmount ? x.discountedAmount : x.productPrice;
    const finalAmount = amountAfterDiscount - discountedCouponAmount;
    return {
      amount: finalAmount,
      deliveryStatus: "pending",
      orderStatus: "pending",
      product_id: x._id
    };
  });
  const order = new Order({
    user_id: req.userDetails.user_id,
    address_id: new ObjectId(req.body.address_id),
    coupounCode: req.body.couponCode,
    paymentMethod: req.body.paymentMethod,
    amount: req.body.amount,
    totalPrice: req.body.totalPrice,
    date: new Date(),
    orderProducts: productDetails,
    orderCreatedByRazorPay: razorObj,
    waller_id: walletId
  });
  const savedOrder = await order.save();
  const OrderList = await Order.find({
    "user_id": req.userDetails.user_id
  });
  const NumberOfOrders = OrderList.length;
  console.log(NumberOfOrders, "number of orders in the user");
  if (NumberOfOrders === 1) {
    const newWallet = new Wallet({
      user_id: req.userDetails.user_id,
      walletAmount: 200,
      transaction: "credit",
      transactionDescription: `For the First Order : ${savedOrder._id.toString()}`,
      transactionDate: Date.now()
    });
    await newWallet.save();
  }
  var resultDelete = await Cart.deleteMany({
    user_id: req.userDetails.user_id
  });
  var userDetails = await User.findOne({
    _id: req.userDetails.user_id
  });
  var address = await Address.findOne({
    "_id": req.body.address_id
  });
  if (userDetails) {
    userDetails.password = "";
    userDetails.address = address;
    if (razorObj) {
      const orderId = razorObj ? razorObj.id : null;
      res.status(200).json({
        orderId: orderId,
        amount: parseInt(req.body.totalPrice),
        userDetails: userDetails
      });
    } else {
      res.status(200).json({
        amount: parseInt(req.body.totalPrice),
        userDetails: userDetails
      });
    }
  } else {
    console.error("User not found");
  }
}
router.post('/verifyRazorPaySignature', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    razorpay.orders.fetch(req.body.orderId, function (err, order) {
      if (err) {
        // Handle the error
      } else {
        // Verify the signature
        const generated_signature = hmac_sha256(req.body.orderId + "|" + req.body.payment_id, process.env.RAZORPAY_API_SECRET_KEY);
        const isSignatureValid = razorpay.utils.verifyPaymentSignature(generated_signature, req.body.payment_id, req.body.orderId, req.body.signature);
        if (isSignatureValid) {
          return res.status(200).json({
            message: "Payment is Successfull"
          });
          // Update your database or perform any other necessary actions
          // Send the success response back to the client
        } else {
          return res.status(500).json({
            message: "Payment is Failed"
          });
          // Send the failure response back to the client
        }
      }
    });
  } catch (ex) {}
});
router.get('/confirmation', jwtVerifyModule.JWTVerify, async (req, res) => {
  res.render('orderConfirmationPage');
});
// to get the order page

router.get('/viewOrderPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  orderController.viewOrderPage(req, res);
});
router.post('/cancelOrder', jwtVerifyModule.JWTVerify, async (req, res) => {
  orderController.cancelOrder(req, res);
});
module.exports = router;