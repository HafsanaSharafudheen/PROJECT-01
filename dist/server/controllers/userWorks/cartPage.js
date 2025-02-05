const Cart = require('../../models/Cart');
const Coupons = require('../../models/coupons');
const Product = require('../../models/product');
const Offer = require('../../models/offer');
const User = require('../../models/userdb');
const Wallet = require('../../models/wallet');
const walletServices = require('../../services/walletServices');
async function getCartpage(req, res) {
  try {
    const cartItems = await Cart.find({
      "user_id": req.userDetails.user_id,
      "deleted": {
        $ne: true
      }
    });
    const walletAmount = await walletServices.calculateWalletSum(req.userDetails.user_id);
    console.log(walletAmount, '-wa---wa-----------wa');
    const productIds = cartItems.map(x => x.product_id);
    const products = await Product.find({
      "_id": {
        $in: productIds
      }
    });
    for (let i = 0; i < products.length; i++) {
      const cartOfProduct = cartItems.find(x => x.product_id.equals(products[i]._id));
      products[i].cartId = cartOfProduct?._id;
      products[i].cartCount = cartOfProduct?.cartCount;
      const offer = await Offer.findOne({
        _id: products[i].offer_id
      });
      if (offer) {
        if (offer.offerType.toLowerCase() === 'percentage') {
          products[i].discountedAmount = offer.DiscountValue / 100 * products[i].productPrice;
        } else if (offer.offerType === 'Amount') {
          products[i].discountedAmount = products[i].productPrice - offer.DiscountValue;
        }
        if (products[i].discountedAmount) {
          let tempDiscountedAmount = products[i].discountedAmount;
          products[i].discountedAmount = products[i].productPrice;
          products[i].productPrice = tempDiscountedAmount;
        }
      }
    }
    let amount;
    amount = products.reduce((acc, curr) => {
      return acc + curr.productPrice * curr.cartCount;
    }, 0);
    let discountedCouponAmount = 0;
    let couponData = null;
    if (req.query.coupounCode) {
      couponData = await Coupons.findOne({
        couponCode: req.query.coupounCode
      });
      if (couponData && couponData.discountType.toLowerCase() === 'percentage') {
        discountedCouponAmount = amount * couponData.discountAmount / 100;
      } else if (couponData && couponData.discountType.toLowerCase() === 'fixed') {
        discountedCouponAmount = couponData.discountAmount;
      }
    }
    amount = amount - discountedCouponAmount;
    res.render('cartPage', {
      products: products,
      cartItems: cartItems,
      amount: Math.floor(amount),
      couponData: couponData,
      walletAmount: walletAmount,
      discountedCouponAmount: Math.floor(discountedCouponAmount)
    });
  } catch (error) {
    console.error('Error fetching product details from cart:', error);
    res.status(500).send('Internal Server Error');
  }
}
async function getCartCount(req, res) {
  const cartItems = await Cart.find({
    "user_id": req.userDetails.user_id,
    deleted: {
      $ne: true
    }
  });
  const cartCount = cartItems.length;
  return res.status(200).json({
    count: cartCount
  });
}
async function addToCart(req, res) {
  try {
    const productDetails = await Product.findOne({
      "productNumber": req.body.productNumber
    });
    if (productDetails) {
      // Check if there's an offer
      const offer = await Offer.findOne({
        _id: productDetails.offer_id
      });

      // Calculate discounted amount
      let discountedAmount = 0;
      if (offer) {
        if (offer.offerType.toLowerCase() === 'percentage') {
          discountedAmount = offer.DiscountValue / 100 * productDetails.productPrice;
        } else if (offer.offerType.toLowerCase() === 'amount') {
          discountedAmount = productDetails.productPrice - offer.DiscountValue;
        }
      }

      // Save to cart with original and offer prices
      const cartItem = new Cart({
        user_id: req.userDetails.user_id,
        product_id: productDetails._id,
        originalPrice: productDetails.productPrice,
        discountedAmount: discountedAmount,
        cartCount: 1,
        date: new Date()
      });
      await cartItem.save();
      return res.status(200).json({
        message: `Product "${productDetails.productName}" added to the cart!`,
        cartItem: cartItem
      });
    }
  } catch (error) {
    console.error('Error while fetching products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function removeFromCart(req, res) {
  try {
    const cartExists = await Cart.findOne({
      '_id': req.query._id
    });
    if (!cartExists) {
      return res.status(400).json({
        message: 'no such product avialable'
      });
    } else {
      const updateCart = await Cart.updateOne({
        '_id': req.query._id
      }, {
        $set: {
          "deleted": true
        }
      });
      res.redirect('/cartPage/cartPage');
    }
  } catch (error) {
    console.error('Errorwhile deleting products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function updateCartQuantity(req, res) {
  const cartItem = await Cart.findOne({
    '_id': req.body.cartId
  });
  const productDetails = await Product.findOne({
    "_id": cartItem.product_id
  });
  if (req.body.action == 'increase') {
    if (cartItem.cartCount < productDetails.stock) {
      const resultIncrement = await Cart.updateOne({
        '_id': req.body.cartId
      }, {
        $inc: {
          cartCount: 1
        }
      });
      return res.status(200).json({
        message: 'Cart count updated successfully'
      });
    } else {
      return res.status(200).json({
        message: 'Out of Stock'
      });
    }
  } else if (req.body.action == 'decrease') {
    const resultDecrement = await Cart.updateOne({
      '_id': req.body.cartId
    }, {
      $inc: {
        cartCount: -1
      }
    });
    return res.status(200).json({
      message: 'Cart count updated successfully'
    });
  } else {
    return res.status(400).json({
      error: 'Invalid action'
    });
  }
}
module.exports = {
  getCartpage: getCartpage,
  getCartCount: getCartCount,
  addToCart: addToCart,
  removeFromCart: removeFromCart,
  updateCartQuantity: updateCartQuantity
};