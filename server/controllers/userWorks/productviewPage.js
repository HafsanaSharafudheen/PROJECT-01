
const Product = require('../../models/product');
const Cart=require('../../models/Cart')
const Wish=require('../../models/WishList')
const Offer=require('../../models/offer')
async function productView(req, res) {
    const productNumber = req.query.productNumber;

    try {
        const currentDate = new Date(); // Define currentDate

        const productDetails = await Product.findOne({ "productNumber": productNumber });
        console.log(productDetails, '---------')

        let discountedAmount = 0; // Declare discountedAmount

        if (productDetails) {
            const cart = await Cart.findOne({ "user_id": req.userDetails.user_id, "product_id": productDetails._id, deleted: { $ne: true } });
            const wish = await Wish.findOne({ "user_id": req.userDetails.user_id, "product_id": productDetails._id, deleted: { $ne: true } });

            const offer = await Offer.findOne({
                _id: productDetails.offer_id
            });

            if (offer) {
                if (offer.offerType.toLowerCase() === 'percentage') {
                    discountedAmount = (offer.DiscountValue / 100) * productDetails.productPrice;
                } else if (offer.offerType === 'Amount') {
                    discountedAmount = productDetails.productPrice - offer.DiscountValue;
                }
            }

            res.render('productViewPage', {
                discountedAmount: discountedAmount,
                productDetails: productDetails,
                isCarted: cart ? true : false,
                isWishListed: wish ? true : false
            });
        } else {
            res.status(400).json({ message: "Product not found" });
        }
    } catch (err) {
        res.status(500).send(err);
    }
}




module.exports = {
    productView: productView,
   
  }
  