const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminWorks = require('../controllers/adminWorks/adminProduct');
const adminOrders = require('../controllers/adminWorks/adminOders');
const userDetails = require('../controllers/adminWorks/userDetails');
const adminCategory = require('../controllers/adminWorks/adminCategory');
const upload = require('../middileware/fileUploader');
const multer = require('multer');
const Offer = require('../models/offer');
const jwtVerifyModule = require('../middileware/JWTverify');
const Product = require('../models/product');
const Category = require('../models/Category');
const Order = require('../models/order');
const User = require('../models/userdb');
const dashboardController = require('../controllers/dashboardController');
const {
  render
} = require('../../app');
router.get('/', (req, res) => {
  res.render('adminLogin');
});
router.post('/', (req, res) => {
  adminController.adminLogin(req, res);
});
router.get('/adminDashboard', jwtVerifyModule.JWTVerify, (req, res) => {
  res.render('adminDashboard');
});
router.get('/adminDashboardGetChart', jwtVerifyModule.JWTVerify, (req, res) => {
  const type = req.query.type;
  if (type === 'sales') {
    dashboardController.chart(req, res);
  } else if (type === 'category') {
    dashboardController.categoryChart(req, res);
  }
});
router.get('/adminCustomers', jwtVerifyModule.JWTVerify, (req, res) => {
  userDetails.fetchUserDetails(req, res);
});
router.post('/blockUser', jwtVerifyModule.JWTVerify, (req, res) => {
  userDetails.blockUser(req, res);
});
router.post('/unblockUser', jwtVerifyModule.JWTVerify, (req, res) => {
  userDetails.unblockUser(req, res);
});
router.get('/adminProducts', jwtVerifyModule.JWTVerify, async (req, res) => {
  adminWorks.adminProducts(req, res);
});
router.post('/getProductByProductNumber', jwtVerifyModule.JWTVerify, async (req, res) => {
  adminWorks.getProductByProductNumber(req, res);
});
router.post('/addProducts', upload.array('photos', 5), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({
      error: 'File upload error: ' + req.fileValidationError
    });
  }
  if (req.body.productNumber) {
    adminWorks.editProducts(req, res);
  } else adminWorks.addProducts(req, res);
});
router.get('/deleteProduct', jwtVerifyModule.JWTVerify, (req, res) => {
  adminWorks.deleteProduct(req, res);
});
router.get('/getCategories', async (req, res) => {
  const categories = await Category.find();
  return res.status(200).json({
    categories: categories
  });
});
router.get('/adminCategories', jwtVerifyModule.JWTVerify, async (req, res) => {
  adminCategory.getAllCategories(req, res);
});
router.post('/getCategoryBycategoryid', jwtVerifyModule.JWTVerify, async (req, res) => {
  adminCategory.getCategoryBycategoryid(req, res);
});
router.post('/addCategory', upload.single('categoryImage'), jwtVerifyModule.JWTVerify, (req, res) => {
  if (req.body._id) {
    adminWorks.editCategory(req, res);
  } else {
    adminWorks.addCategory(req, res);
  }
});
router.get('/deleteCategory', jwtVerifyModule.JWTVerify, (req, res) => {
  adminWorks.deleteCategory(req, res);
});
router.get('/adminOrders', jwtVerifyModule.JWTVerify, async (req, res) => {
  adminOrders.adminOrders(req, res);
});
router.post('/shipOrder', jwtVerifyModule.JWTVerify, (req, res) => {
  adminOrders.shipOrders(req, res);
});
router.post('/deliveryOrder', jwtVerifyModule.JWTVerify, (req, res) => {
  adminOrders.deliveryOrder(req, res);
});
router.get('/adminReviews', jwtVerifyModule.JWTVerify, (req, res) => {
  res.render('adminReviews');
});
router.get('/logout', jwtVerifyModule.JWTVerify, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    } else {
      res.redirect('/admin');
    }
  });
});
module.exports = router;