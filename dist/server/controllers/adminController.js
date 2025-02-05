const jwt = require('jsonwebtoken');
function adminLogin(req, res) {
  try {
    if (process.env.ADMIN_EMAIL == req.body.email && process.env.ADMIN_PASSWORD == req.body.password) {
      // Create a JWT token for the user

      const tokenExpiration = req.body.rememberMe ? '7d' : '24h';
      const token = jwt.sign({
        userId: req.body.email._id
      }, process.env.JWTKEY, {
        expiresIn: tokenExpiration
      });
      //for saving token to the client side
      res.cookie('token', token, {
        maxAge: req.body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
        // Milliseconds
        httpOnly: true,
        secure: true
      });
      return res.status(200).json({
        message: 'authentication done'
      });
    } else {
      return res.status(401).json({
        message: 'User Not Found'
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}
module.exports = {
  adminLogin: adminLogin
};