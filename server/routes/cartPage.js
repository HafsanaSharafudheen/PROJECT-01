const express=require('express');
const router=express.Router();
const Cart=require('../models/Cart');
const Wish=require('../models/WishList')
const Product=require('../models/product')
const jwtVerifyModule = require('../middileware/JWTverify');
const Coupons=require('../models/coupons')
const Offer=require('../models/offer');
const product = require('../models/product');
router.get('/cartPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
      const cartItems = await Cart.find({ "user_id": req.userDetails.user_id, "deleted": { $ne: true } });

      if (!cartItems || cartItems.length === 0) {
          // Handle empty cart
          return res.render('emptyCartPage'); // Render a page for an empty cart
      }

      const productIds = cartItems.map(x => x.product_id);
      const products = await Product.find({ "_id": { $in: productIds } });

      for (let i = 0; i < products.length; i++) {
          const cartOfProduct = cartItems.find(x => x.product_id.equals(products[i]._id));
          products[i].cartId = cartOfProduct?._id;
          products[i].cartCount = cartOfProduct?.cartCount;
          const offer = await Offer.findOne({
            _id: products[i].offer_id
          })
          if (offer) {
            if (offer.offerType.toLowerCase() === 'percentage') {
              products[i].discountedAmount = (offer.DiscountValue / 100) * products[i].productPrice
            } else if (offer.offerType === 'Amount') {
              products[i].discountedAmount = products[i].productPrice - offer.DiscountValue;
            }
if(products[i].discountedAmount){
let tempDiscountedAmount=products[i].discountedAmount;
products[i].discountedAmount=products[i].productPrice;
products[i].productPrice=tempDiscountedAmount;
}
            
  
          }
      }

      let amount; // Declare amount outside the if block
      
          amount = products.reduce((acc, curr) => {
              return acc + (curr.productPrice * curr.cartCount);
          }, 0);
      

      const coupon = await Coupons.findOne({});

      let discountedCouponAmount = 0;

      if (coupon && coupon.discountType === 'Percentage') {
          discountedCouponAmount = (coupon.discountAmount / 100) * amount;
      } else if (coupon && coupon.discountType === 'Fixed Amount') {
          discountedCouponAmount = coupon.discountedCouponAmount;
      }

      const updatedAmount = amount - discountedCouponAmount;

      res.render('cartPage', {
          products: products,
          cartItems: cartItems,
          amount:Math.floor(amount),
          coupon: coupon,
          updatedAmount:Math.floor(updatedAmount) 
      });
  } catch (error) {
      console.error('Error fetching product details from cart:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/getCartCount', jwtVerifyModule.JWTVerify,async(req,res)=>{

    const cartItems=await Cart.find({ "user_id":req.userDetails.user_id,deleted:{$ne:true}});
    const cartCount = cartItems.length;


    return res.status(200).json({count:cartCount});

})

router.post('/addToCart',jwtVerifyModule.JWTVerify,async (req,res)=>{
try{
    console.log('start')
    const productDetails = await Product.findOne({
        "productNumber": req.body.productNumber
      });

      if (productDetails) {
        // Check if there's an offer
        const offer = await Offer.findOne({ _id: productDetails.offer_id });

        // Calculate discounted amount
        let discountedAmount = 0;
        if (offer) {
            if (offer.offerType.toLowerCase() === 'percentage') {
                discountedAmount = (offer.DiscountValue / 100) * productDetails.productPrice;
            } else if (offer.offerType.toLowerCase() === 'amount') {
                discountedAmount =  productDetails.productPrice-offer.DiscountValue;
            }
        }
        
        // Save to cart with original and offer prices
        const cartItem = new Cart({
            user_id: req.userDetails.user_id,
            product_id: productDetails._id,
            originalPrice: productDetails.productPrice,
            discountedAmount:discountedAmount,
            cartCount: 1,
            date: new Date()
        });
        


          await cartItem.save();

  console.log('end')
   return res.status(200).json({message: `Product "${productDetails.productName}" added to the cart!`, cartItem: cartItem });

}
}
catch (error) {
    console.error('Error while fetching products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
    
})
router.get('/removeFromCart',jwtVerifyModule.JWTVerify,async(req,res)=>{
  try{
    const cartExists = await Cart.findOne({
      '_id': req.query._id
    })
    if(!cartExists){
      return res.status(400).json({
        message: 'no such product avialable'
      });
    }
    else{
      const updateCart= await Cart.updateOne({ '_id': req.query._id}, { $set: { "deleted": true} })
      res.redirect('/cartPage/cartPage')
    }

  }catch (error) {
    console.error('Errorwhile deleting products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });

  }


} )

router.post('/updateQuantity',async (req,res)=>{
  const cartItem=await Cart.findOne({  '_id': req.body.cartId});

  const productDetails = await Product.findOne({
    "_id": cartItem.product_id
  });


  if(req.body.action=='increase'){
    if(cartItem.cartCount<productDetails.stock){

    
    const resultIncrement = await Cart.updateOne({ '_id': req.body.cartId },{ $inc: { cartCount: 1 } });
     return res.status(200).json({ message: 'Cart count updated successfully' });
    }
    else{
      return res.status(200).json({ message: 'Out of Stock' });
      
    }
  }
  else if(req.body.action=='decrease'){
    const resultDecrement = await Cart.updateOne({ '_id': req.body.cartId },{ $inc: { cartCount: -1 } });
    return res.status(200).json({ message: 'Cart count updated successfully'});

  }
  else{
    return res.status(400).json({ error: 'Invalid action' });

  }

})




module.exports=router;





 
