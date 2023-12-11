const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Razorpay = require('razorpay');
const User=require('../models/userdb')
const Cart = require('../models/Cart');
const Order = require('../models/order');
const Address = require('../models/address')
const jwtVerifyModule = require('../middileware/JWTverify')
const { ObjectId } = require('mongodb');
const Offer=require('../models/offer');

router.post('/addressPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  const addressList = await Address.find({
    "user_id": req.userDetails.user_id
  })
  
  console.log(req.body,'cccccccccccccccccccc')
  return res.render('checkOut', {
    addressList: addressList,
    summary: req.body

  })
})

router.post('/saveAddress', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    console.log(req.body, "saving address is my problem");

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
 
if(req.body.paymentMethod==="CASH ON DELIVERY"){
  OrderSave(req,res,null);
  return
}
  
  try {

    // create order in razorpay 

    const Razorpay = require('razorpay');
    var instance = new Razorpay(
      {
         key_id:process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_API_SECRET_KEY
      })
    
    var options = {
      amount: parseFloat(req.body.amount)*100,
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    console.log("Options ",options)
    instance.orders.create(options, function(err, order) {
      console.log("Create Order",order);
      if(order){
       OrderSave(req,res,order);
      } else {
        console.log(err)
        res.status(500).json({          
          error: err ? err.statusCode+" "+err.error.description : 'Internal server error'
        });
        
        
      }
    });

  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }

});


 async function OrderSave(req,res,razorObj){
  
    
  const cartItems = await Cart.find({
    "user_id": req.userDetails.user_id,
    "deleted": {
      $ne: true
    }
  });
  const productIds = cartItems.map(x => {
    return x.product_id
  })
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

        products[i].discountedAmount = (offer.DiscountValue / 100) * products[i].productPrice;
      } else if (offer.offerType === 'Amount') {
        products[i].discountedAmount = products[i].productPrice - offer.DiscountValue;
      }
    }
    if(cartOfProduct){
      for(let j=0;j<cartOfProduct.cartCount;j++){
        productsArray.push(products[i]);

    }

    }
  }

  const productDetails = products.map(x => {
    return {
      amount:x.discountedAmount?x.discountedAmount:x.productPrice,
      deliveyStatus: "pending",
      orderStatus: "pending",
      product_id: x._id,
    };  
  })
  console.log(productDetails);

    const order = new Order({

      user_id: req.userDetails.user_id,
      address_id:  new ObjectId(req.body.address_id),
      paymentMethod: req.body.paymentMethod,
      amount: req.body.amount,
      totalPrice: req.body.totalPrice,
      date: new Date(),
      orderProducts: productDetails,
      orderCreatedByRazorPay:razorObj

    });

  const savedOrder = await order.save();



  //delete all the cart items
  var resultDelete = await Cart.deleteMany({
    user_id: req.userDetails.user_id
  })
var userDetails=await User.findOne({_id: req.userDetails.user_id})
var address= await Address.findOne({"_id": req.body.address_id})
if (userDetails) {
  userDetails.password = "";
  userDetails.address=address;
if(razorObj){
  const orderId = razorObj ? razorObj.id : null;
  res.status(200).json({ orderId: orderId, amount: parseInt(req.body.totalPrice), userDetails:userDetails });
}
else{
  res.status(200).json({ amount: parseInt(req.body.totalPrice), userDetails:userDetails });

}
}
else {
  console.error("User not found");
}
}


router.post('/verifyRazorPaySignature', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {

    razorpay.orders.fetch(req.body.orderId, function(err, order) {
      if (err) {
        // Handle the error
      } else {
        // Verify the signature
       const  generated_signature = hmac_sha256(req.body.orderId + "|" + req.body.payment_id, process.env.RAZORPAY_API_SECRET_KEY);


      
        const isSignatureValid = razorpay.utils.verifyPaymentSignature(
          generated_signature,
          req.body.payment_id,
          req.body.orderId,
          req.body.signature
        );
        if (isSignatureValid) {
          return res.status(200).json({message:"Payment is Successfull"})
          // Update your database or perform any other necessary actions
          // Send the success response back to the client
        } else {
          return res.status(500).json({message:"Payment is Failed"})
          // Send the failure response back to the client
        }
      }
    });
  }
   catch(ex){

  }
});

router.get('/confirmation', jwtVerifyModule.JWTVerify, async (req, res) => {
  
 res.render('orderConfirmationPage')
});
// to get the order page

router.get('/viewOrderPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    // Fetch orders for the user
    const orders = await Order.find({
      "user_id": req.userDetails.user_id
    });
console.log(orders.length,'oooorrrrrrrrrrrrdeeeersssssssssssssssss')
    // Flatten orderProducts and extract relevant information
    const result = orders.flatMap(order => order.orderProducts.map(x => ({
      orderStatus: x.orderStatus,
      amount: x.amount,
      DeliveryDate: x.DeliveryDate,
      product_id: x.product_id,
      orderid: order._id,
      // DeliveryStatus:x.DeliveryStatus
    })));

    // Use the productIds to fetch product details
    const productIds = result.map(x => x.product_id);
    const products = await Product.find({
      "_id": {
        $in: productIds
      }
    });

   

    // Match products with result
    for (let i = 0; i < result.length; i++) {
      const product = products.find(x => x._id == result[i].product_id);
      if (product) {
        result[i].productImage = product.productImages[0].imageName;
        result[i].productName = product.productName;
        result[i].productCategory=product.productCategory;
      }
    }

    res.render('orderPage', {
      orders: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/cancelOrder', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
  
    const orderExists = await Order.findOne({
      '_id': req.body._id
    })
    if (!orderExists) {
      return res.status(400).json({
        message: 'no such order avialable'
      });
    } else {
      
      const update = await Order.findOneAndUpdate(
        {"_id":req.body._id, "orderProducts.product_id": req.body.product_id},
        { $set: { "orderProducts.$.orderStatus":"Cancelled"} },
       
      );
      return res.status(200).json({
        message: 'order cancelled Successfully'
      })
    }

  } catch (error) {
    console.error('Errorwhile deleting orders:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });

  }
})

module.exports = router;