const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')
const adminWorks = require('../controllers/adminWorks/adminProduct')
const userDetails = require('../controllers/adminWorks/userDetails')
const upload = require('../middileware/fileUploader')
const jwtVerifyModule = require('../middileware/JWTverify')
const Product = require('../models/product')
const Category = require('../models/Category')
const Order=require('../models/order')
const User=require('../models/userdb');
const { render } = require('../../app');

router.get('/', (req, res) => {
  res.render('adminLogin')
})

router.post('/', (req, res) => {
  adminController.adminLogin(req, res);
})

router.get('/adminDashboard', jwtVerifyModule.JWTVerify, (req, res) => {

  res.render('adminDashboard')
})


router.get('/adminCustomers', jwtVerifyModule.JWTVerify, (req, res) => {
  userDetails.fetchUserDetails(req, res)
})

router.post('/blockUser', jwtVerifyModule.JWTVerify, (req, res) => {
  userDetails.blockUser(req, res)
})
router.post('/unblockUser', jwtVerifyModule.JWTVerify, (req, res) => {
  userDetails.unblockUser(req, res)
})





router.get('/adminProducts', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    const products = await Product.find({});
    const categories=await Category.find({})

      res.render('adminProducts', {
        products: products,categories:categories
      });
    
  } catch (error) {
    console.error('Error while fetching products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

router.get('/test',async (req,res)=>{
  res.render('test')
})

router.post('/getProductByProductNumber', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    const product = await Product.findOne({
      "productNumber": req.body.productNumber
    });

    if (!product) {
      return res.status(400).json({
        message: "No product available"
      });
    } else {
      console.log(product)
      return res.status(200).json({
        product: product
      });
    }
  } catch (error) {
    console.error('Error while fetching products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

router.post('/addProducts', upload.array('photos', 5), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({
      error: 'File upload error: ' + req.fileValidationError
    });
  }
  console.log(req.body)
  if (req.body.productNumber) {
    adminWorks.editProducts(req, res)
  } else
    adminWorks.addProducts(req, res)


});
router.get('/deleteProduct',jwtVerifyModule.JWTVerify,  (req, res) => {
  adminWorks.deleteProduct(req, res)
})

router.get('/getCategories',async(req,res)=>{
  const categories = await Category.find();
  return res.status(200).json({categories:categories})
})

router.get('/adminCategories', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    const categories = await Category.find({});

    // Render the 'adminProducts' view with the products data
    res.render('adminCategories', {
      categories: categories
    });

  } catch (error) {
    console.error('Error while fetching categories:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});



router.post('/getCategoryBycategoryid', jwtVerifyModule.JWTVerify, async (req, res) => {
  try {
    const category = await Category.findOne({
      "_id": req.body._id
    });

    if (!category) {
      return res.status(400).json({
        message: "No category available"
      });
    } else {
      return res.status(200).json({
        data: category
      });
    }
  } catch (error) {
    console.error('Error while fetching category:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

router.post('/addCategory',jwtVerifyModule.JWTVerify, (req, res) => {

  console.log(req.body)
  if (req.body._id) {
    adminWorks.editCategory(req, res)
  } else {
    adminWorks.addCategory(req, res)
  }

});


router.get('/deleteCategory',jwtVerifyModule.JWTVerify,  (req, res) => {
  adminWorks.deleteCategory(req, res)
})


router.get('/adminTransactions', jwtVerifyModule.JWTVerify, (req, res) => {
  res.render('adminTransactions');
});

router.get('/adminOrders', jwtVerifyModule.JWTVerify, async (req, res) => {
  var orders = await Order.find({})
  var users=await User.find({})
  console.log(orders)

  // Use the productIds to fetch product details
  console.log(products, "products")
  var result = orders.flatMap(order => order.orderProducts.map(x => ({
    orderStatus: x.orderStatus,
    amount: x.amount,
    DeliveryDate: x.DeliveryDate,
    product_id: x.product_id,

    orderid: order._id,
    paymentMethod:order.paymentMethod
  })));
  console.log(result,"reeeeeeeeeeee")
  const productIds = result.map(x => {
    return x.product_id
  })
  var products = await Product.find({
    "_id": {
      $in: productIds
    }
  });
  // const userIds = users.map(x => {
  //   return x.user_id
  // })
  // var users = await Product.find({
  //   "_id": {
  //     $in: userIds
  //   }
  // });

  for (let i = 0; i < result.length; i++) {
    var product = products.find(x => x._id == result[i].product_id)
    if (product) {
      result[i].productImage = product.productImages[0].imageName;
      result[i].productName = product.productName;
      result[i],productCategory=product.productCategory;
    
    result[i].productPrice=product.productPrice
  }

}
  res.render('adminOrders',{orders:result});
});
router.get('/adminReviews', jwtVerifyModule.JWTVerify, (req, res) => {
  res.render('adminReviews');
});





module.exports = router;