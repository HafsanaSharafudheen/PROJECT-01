const express=require('express');
const router=express.Router();
const Product=require('../models/product');
const Cart=require('../models/Cart');

const Wish=require('../models/WishList')


const jwtVerifyModule = require('../middileware/JWTverify')
const productViewPage=require('../controllers/userWorks/productviewPage')


router.get('/',jwtVerifyModule.JWTVerify, async (req,res)=>{
    try {
      console.log(req.body);
        const products = await Product.find({"deleted":false});
      //const wish=await Wish.findOne({ "user_id":req.userDetails.user_id,"product_id":products._id,deleted:{$ne:true}})

        if (!products || products.length === 0) {
          return res.status(400).json({ message: "No products available" });
        } else {


for(let i=0;i<products.length;i++){

        const wish=await Wish.findOne({ "user_id":req.userDetails.user_id,"product_id":products[i]._id,deleted:{$ne:true}})

  products[i].isWishListed=wish?true:false
}


          // Render the 'adminProducts' view with the products data
          res.render('homepage', { products: products, isWishListed:true});
        }
      } catch (error) {
        console.error('Error while fetching products:', error);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
})

router.get('/productViewPage',jwtVerifyModule.JWTVerify,(req,res)=>{
  productViewPage.productView(req,res)
})






module.exports=router;