const express = require('express');
const otpController = require('../controllers/otpController');
const sign_upController = require('../controllers/sign_upController');
const router = express.Router();
require('../controllers/sign_upController');
router.get('/', (req, res) => {
  res.render('sign_up');
});
router.post('/send-otp', (req, res) => {
  sign_upController.signupVerification(req, res);
});
router.post('/verify-otp', (req, res) => {
  otpController.OTPVerificationEmail(req, res, insertUser);
  function insertUser() {
    sign_upController.insertUser(req, res);
  }
});
module.exports = router;