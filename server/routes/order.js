const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Cart = require('../models/Cart');
const Order = require('../models/order');
const Address = require('../models/address')
const jwtVerifyModule = require('../middileware/JWTverify')


router.post('/addressPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  console.log("body------------------------", req.body)
  const addressList = await Address.find({
    "user_id": req.userDetails.user_id
  })
  return res.render('addressPage', {
    addressList: addressList,
    summary: req.body

  })
})

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
      user_id: req.body.user_id
    });

    await newAddress.save();


    res.status(200).json({
      message: "Success"
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
})

router.post('/orderConfirmation', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
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
    const productDetails = products.map(x => {
      return {
        amount: x.productPrice,
        deliveyStatus: "pending",
        orderStatus: "pending",
        product_id: x._id
      };
    })
    console.log(productDetails);

    const order = new Order({

      user_id: req.userDetails.user_id,
      address_id: req.body.address_id,
      paymentMethod: req.body.paymentMethod,
      amount: req.body.amount,
      totalPrice: req.body.totalPrice,
      date: new Date(),
      orderProducts: productDetails

    });

    const savedOrder = await order.save();



    //delete all the cart items
    var resultDelete = await Cart.deleteMany({
      user_id: req.userDetails.user_id
    })

    res.redirect("/order/confirmation");

  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

router.get('/confirmation', jwtVerifyModule.JWTVerify, async (req, res) => {


  res.render("orderConfirmationPage")
});
// to get the order page

router.get('/viewOrderPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  var orders = await Order.find({
    "user_id": req.userDetails.user_id
  })
  console.log(orders)

  // Use the productIds to fetch product details
  console.log(products, "products")
  var result = orders.flatMap(order => order.orderProducts.map(x => ({
    orderStatus: x.orderStatus,
    amount: x.amount,
    DeliveryDate: x.DeliveryDate,
    product_id: x.product_id,
    orderid: order._id
  })));
  const productIds = result.map(x => {
    return x.product_id
  })
  var products = await Product.find({
    "_id": {
      $in: productIds
    }
  });


  for (let i = 0; i < result.length; i++) {
    var product = products.find(x => x._id == result[i].product_id)
    if (product) {
      result[i].productImage = product.productImages[0].imageName;
      result[i].productName = product.productName

    }
  }

  console.log(result, "result");
  res.render('orderPage', {
    orders: result
  })
})
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