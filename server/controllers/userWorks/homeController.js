const Product=require('../../models/product');
const Category=require('../../models/Category')
const Offer=require('../../models/offer');
const Wish=require('../../models/WishList')
async function getHomePage(req,res){
    try {
        const category = req.query.category;
  
        // All categories taken from the database
        const allCategories = await Category.find({});
        const currentDate = new Date();
        const nonExpiredOffers = await Offer.find({
          deleted: false,
          offerStartDate: {
            $lte: currentDate
          }, // Offer has started
          offerEndDate: {
            $gte: currentDate
          } // Offer has not ended
        });
        console.log(nonExpiredOffers)
  //All products taken from the product database except deleted products
        let products = [];
  
  
        // const wish=await Wish.findOne({ "user_id":req.userDetails.user_id,"product_id":products._id,deleted:{$ne:true}})
        if (req.query.offer_id) {
          console.log('11')
          const productsBasedOffer = await Product.find({
            offer_id: req.query.offer_id
          })
  
          products = productsBasedOffer
  
        } else if (req.query.category) {
          console.log('22')
  
          const productsBasedCategory = await Product.find({
            productCategory: req.query.category
          });
  
          products = productsBasedCategory
  
        } else {
          console.log('33')
  
          const allProducts = await Product.find({
            "deleted": false
          });
  console.log(allProducts.length)
          products = allProducts
        }
        for (let i = 0; i < products.length; i++) {
          const wish = await Wish.findOne({
            "user_id": req.userDetails.user_id,
            "product_id": products[i]._id,
            deleted: {
              $ne: true
            }
          })
          products[i].isWishListed = wish ? true : false
          const offer = await Offer.findOne({
            _id: products[i].offer_id
          })
          if (offer) {
            if (offer.offerType.toLowerCase() === 'percentage') {
              products[i].discountedAmount = (offer.DiscountValue / 100) * products[i].productPrice
            } else if (offer.offerType === 'Amount') {
              products[i].discountedAmount = products[i].productPrice - offer.DiscountValue;
            }
  
          }
        }
  console.log(products.length)
        res.render('homepage', {
          allOffers:nonExpiredOffers,
          offerId: req.query.offer_id,
  
          products: products,
          selectedCategory: category,
          searchTerm: ""
        });
  
      } catch (error) {
        console.error('Error while fetching products:', error);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
}
async function searchProducts(req,res){
    try {
        const searchTerm = req.query.searchTerm;
        if (!searchTerm) {
          return res.status(400).json({
            message: "Search term is missing"
          });
        }
  
        // Search in multiple fields directly
        const products = await Product.find({
          $or: [{
              productName: {
                $regex: new RegExp(searchTerm, 'i')
              }
            },
            {
              productDescription: {
                $regex: new RegExp(searchTerm, 'i')
              }
            },
            {
              brandName: {
                $regex: new RegExp(searchTerm, 'i')
              }
            },
          ],
        });
  
  
        for (let i = 0; i < products.length; i++) {
          const wish = await Wish.findOne({
            "user_id": req.userDetails.user_id,
            "product_id": products[i]._id,
            deleted: {
              $ne: true
            }
          })
          products[i].isWishListed = wish ? true : false
          const offer = await Offer.findOne({
            _id: products[i].offer_id
          })
          if (offer) {
            if (offer.offerType.toLowerCase() === 'percentage') {
              products[i].discountedAmount = (offer.DiscountValue / 100) * product[i].productPrice
            } else if (offer.offerType === 'Amount') {
              products[i].discountedAmount = products[i].productPrice - offer.DiscountValue;
            }
          }
        }
  
        res.render('homepage', {
          products: products,
          selectedCategory: "",
          searchTerm: searchTerm
        });
      } catch (error) {
        console.error('Error during product search:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      }
}
module.exports = {
    getHomePage:getHomePage,
    searchProducts:searchProducts,
  }