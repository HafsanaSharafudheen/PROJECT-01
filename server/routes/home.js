  const express = require('express');
  const router = express.Router();
  const Product = require('../models/product');
  const Cart = require('../models/Cart');
  const Category = require('../models/Category')
  const Wish = require('../models/WishList')
  const Offer = require('../models/offer')
  const mongoose = require('mongoose');
const homeController=require('../controllers/userWorks/homeController')
  const jwtVerifyModule = require('../middileware/JWTverify')
  const productViewPage = require('../controllers/userWorks/productviewPage');
  const product = require('../models/product');

  router.get('/', jwtVerifyModule.JWTVerify, async (req, res) => {
    homeController.getHomePage(req,res);
  
  });

  router.get('/searchProducts', jwtVerifyModule.JWTVerify, async (req, res) => {
    homeController.searchProducts(req,res);
  
  });


  router.get('/productViewPage', jwtVerifyModule.JWTVerify, (req, res) => {
    productViewPage.productView(req, res)
  })

  module.exports = router;