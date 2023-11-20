const express=require('express');
const router=express.Router();
const Cart=require('../models/Cart');
const Wish=require('../models/WishList')
const Product=require('../models/product')
const jwtVerifyModule = require('../middileware/JWTverify');


router.get('/cartPage',jwtVerifyModule.JWTVerify, async(req,res)=>{
  try{
    const cartItems=await Cart.find({ "user_id":req.userDetails.user_id,"deleted":{$ne:true}});
console.log(cartItems)
    if (!cartItems) {
      throw new Error('Cart not found');
    }

    const productIds= cartItems.map(x=>{
      return x.product_id
    })
    // Use the productIds to fetch product details
    var products =  await Product.find({ "_id": { $in: productIds } });

    products = JSON.parse(JSON.stringify(products))
    for (let i = 0; i < products.length; i++) {
      var cartOfProduct = cartItems.find(x => x.product_id.equals(products[i]._id))
      console.log(cartOfProduct)
      products[i].cartId = cartOfProduct?._id;
      products[i].cartCount = cartOfProduct?.cartCount;
    }

    var amount = products.reduce((acc, curr) => {
      return acc +( curr.productPrice*curr.cartCount);
    }, 0);
    
    
    res.render('cartPage',{products:products,cartItems:cartItems,amount:amount});
  }
  catch (error) {
    console.error('Error fetching product details from cart:', error);
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
    const product = await Product.findOne({
        "productNumber": req.body.productNumber
      });

      if (!product) {
        return res.status(400).json({
          message: "No product available"
        });
      } else {
          
        const cartItem = new Cart({
           
            "product_id": product._id,
            "user_id":req.userDetails.user_id,
            "cartCount":1,
            "date": new Date()
          });

          await cartItem.save();

  console.log('end')
   return res.status(200).json({message: `Product "${product.productName}" added to the cart!`, cartItem: cartItem });

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
  if(req.body.action=='increase'){
    const resultIncrement = await Cart.updateOne({ '_id': req.body.cartId },{ $inc: { cartCount: 1 } });
     return res.status(200).json({ message: 'Cart count updated successfully' });

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





 
