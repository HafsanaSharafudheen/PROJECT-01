const express = require('express');
const router = express.Router();
const Wish = require('../models/WishList')
const Cart=require('../models/Cart')
const Product = require('../models/product')
const jwtVerifyModule = require('../middileware/JWTverify');

router.get('/wishlist', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    const wishItems = await Wish.find({
      "user_id": req.userDetails.user_id
    });
    
    if (!wishItems) {
      throw new Error('wishlist not found');
    }

    const productIds = wishItems.map(x => {
      return x.product_id
    })
    // Use the productIds to fetch product details
    const products = await Product.find({
      _id: {
        $in: productIds
      }
    });

console.log(products,"products of wishlist")

    res.render('wishListPage', {
      wishlist: wishItems,products:products
    });

  } catch (error) {
    console.error('Error fetching product details from wishlist:', error);
  }

});
router.get('/getWishlistCount', jwtVerifyModule.JWTVerify, async (req, res) => {

  const wishItems = await Wish.find({
    "user_id": req.userDetails.user_id
  });
  const wishlistCount = wishItems.length;

  console.log(wishlistCount,"wishlist counts");

  return res.status(200).json({
    count: wishlistCount
  });

})

router.post('/addToWishlist', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    
    const product = await Product.findOne({
      "productNumber": req.body.productNumber
    });
    

    if (!product) {
      return res.status(400).json({
        message: "No product available"
      });
    } else {

      const items=await Wish.findOne({"user_id": req.userDetails.user_id,"product_id":product._id})
      
if(items){
  await Wish.deleteMany({"user_id": req.userDetails.user_id,"product_id":product._id})
  res.status(200).json({
    message: "Success"
  });}else{


      const wishItems = new Wish({

        "product_id": product._id,
        "user_id": req.userDetails.user_id,
        "date": new Date()
      });
      

      await wishItems.save();
      

      
      res.status(200).json({
        message: "Success",
        wishItems: wishItems
      });

    }
  }
  } catch (error) {
    console.log('Error while fetching products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }

})

module.exports = router;