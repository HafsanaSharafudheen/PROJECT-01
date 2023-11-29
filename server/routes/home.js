const express=require('express');
const router=express.Router();
const Product=require('../models/product');
const Cart=require('../models/Cart');
const Category=require('../models/Category')
const Wish=require('../models/WishList')


const jwtVerifyModule = require('../middileware/JWTverify')
const productViewPage=require('../controllers/userWorks/productviewPage')

router.get('/', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
      console.log(req.body);
      const category = req.query.category;
      console.log(category, "category.............")

      // All categories taken from the database
      const allCategories = await Category.find({});

      // All products taken from the product database except deleted products
      const allProducts = await Product.find({ "deleted": false });

      // Take the products based on the category selected by the user
      const productsBasedCategory = await Product.find({ productCategory: req.query.category });
      const products = req.query.category ? productsBasedCategory : allProducts;

      // const wish=await Wish.findOne({ "user_id":req.userDetails.user_id,"product_id":products._id,deleted:{$ne:true}})
      
          for (let i = 0; i < products.length; i++) {
              const wish = await Wish.findOne({ "user_id": req.userDetails.user_id, "product_id": products[i]._id, deleted: { $ne: true } })
              products[i].isWishListed = wish ? true : false
          }

          res.render('homepage', {
              products: products,
              selectedCategory: category,
              searchTerm:""
          });
      
  } catch (error) {
      console.error('Error while fetching products:', error);
      return res.status(500).json({
          error: 'Internal server error'
      });
  }
});

router.get('/searchProducts', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm;
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is missing" });
    }

    // Search in multiple fields directly
    const products = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(searchTerm, 'i') } },
        { productDescription: { $regex: new RegExp(searchTerm, 'i') } },
        { brandName: { $regex: new RegExp(searchTerm, 'i') } },
      ],
    });

    
  for (let i = 0; i < products.length; i++) {
    const wish = await Wish.findOne({ "user_id": req.userDetails.user_id, "product_id": products[i]._id, deleted: { $ne: true } })
    products[i].isWishListed = wish ? true : false
}

    res.render('homepage',{ products:products,selectedCategory:"",searchTerm:searchTerm});
    } catch (error) {
    console.error('Error during product search:', error);
    res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/productViewPage',jwtVerifyModule.JWTVerify,(req,res)=>{
  productViewPage.productView(req,res)
})






module.exports=router;