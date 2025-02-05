const express = require('express');
const router = express.Router();
const jwtVerifyModule = require('../middileware/JWTverify');
const wallet = require('../models/wallet');
const walletServices = require('../services/walletServices');
const Order = require('../models/order');
const {
  ObjectId
} = require('mongodb');
router.get('/', jwtVerifyModule.JWTVerify, async (req, res) => {
  const userId = req.userDetails.user_id;
  const userWallet = await wallet.find({
    "user_id": req.userDetails.user_id
  });
  const totalWalletAmount = await walletServices.calculateWalletSum(userId);
  console.log(totalWalletAmount, ".....................");
  res.render("walletPage", {
    userWallet: userWallet,
    totalWalletAmount: totalWalletAmount
  });
});
module.exports = router;