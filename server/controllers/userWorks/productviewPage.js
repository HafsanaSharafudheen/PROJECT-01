
const Product = require('../../models/product');
const Cart=require('../../models/Cart')


async function productView(req,res){
    const productNumber=req.query.ProductNumber;

    try{
console.log(req.query.productNumber)
        const productDetails=await Product.findOne({"productNumber":req.query.productNumber})
        if(productDetails){
            const cart=await Cart.findOne({ "user_id":req.userDetails.user_id,"product_id":productDetails._id,deleted:{$ne:true}})
            res.render('productViewPage', { productDetails:productDetails,isCarted:cart?true:false,isWhishListed:cart?true:false});
        }
        else{

            res.status.send(400).json({message:"product not found"})
        }
    }
    catch (err) {
        res.status(500).send(err);
      }

}


module.exports = {
    productView: productView,
   
  }
  