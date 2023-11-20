const jwt = require('jsonwebtoken');
function JWTVerify(req,res, next){
    // Your JWT secret key, which should match the one used to sign the token.
    const jwtSecret =process.env.JWTKEY;
    // The JWT token you want to verify (e.g., from a request header).
    const token = req.cookies.token;
    
    
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        // JWT verification failed (e.g., expired token or invalid signature)
        console.error('JWT verification failed:', err);
        res.send(401, "Unauthorized")
      } else {
        // JWT verification successful        
        req.userDetails=decoded;
        next();
      }
    });
    
}
module.exports = {
    JWTVerify:JWTVerify
   
  }