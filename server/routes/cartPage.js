const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Wish = require('../models/WishList')
const Product = require('../models/product')
const jwtVerifyModule = require('../middileware/JWTverify');
const Coupons = require('../models/coupons')
const Offer = require('../models/offer');
const product = require('../models/product');
const cartPage = require('../controllers/userWorks/cartPage')
router.get('/cartPage', jwtVerifyModule.JWTVerify, async (req, res) => {
  cartPage.getCartpage(req, res);
});


router.get('/getCartCount', jwtVerifyModule.JWTVerify, async (req, res) => {
  cartPage.getCartCount(req, res);

})

router.post('/addToCart', jwtVerifyModule.JWTVerify, async (req, res) => {
  cartPage.addToCart(req, res);

})
router.get('/removeFromCart', jwtVerifyModule.JWTVerify, async (req, res) => {
  cartPage.removeFromCart(req, res);
})

router.post('/updateQuantity', async (req, res) => {
  cartPage.updateCartQuantity(req, res);
})

module.exports = router;
