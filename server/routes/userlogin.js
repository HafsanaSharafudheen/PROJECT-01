const express=require('express');
var router = express.Router();
const loginController=require('../controllers/loginController');

router.get('/',(req, res)=> {
   res.render('userlogin');
 });

router.post('/',(req,res)=>{
loginController.userVerification(req,res);
})




module.exports=router;