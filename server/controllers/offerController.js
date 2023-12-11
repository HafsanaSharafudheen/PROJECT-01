const Offer = require('../models/offer');
const Product=require('../models/product')

async function addNewOffer(req, res) {
    try {
      console.log(req.file)
        const offerExists = await Offer.findOne({
            'offerName': req.body.offerName
          })
          if (offerExists) {
            return res.status(400).json({
              message: 'Offer already exists'
            });
          } 
        const newOffer = new Offer({
            offerName: req.body.offerName,
            DiscountValue: req.body.DiscountValue,
            offerStartDate: req.body.offerStartDate,
            offerType: req.body.offerType,
            offerEndDate: req.body.offerEndDate,
            offerDescription: req.body.offerDescription,
            bannerImage: req.file?.filename,
        });
        await newOffer.save();

        return res.status(200).json({
            message: 'Offer added successfully',
        });
    } catch (error) {
        console.error('Error while adding offer:', error);

        // Provide a more meaningful error message to the client
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}
async function deleteOffer(req,res){
    try{
      const offerExists = await Offer.findOne({
        '_id': req.query._id
      })
      if(!offerExists){
        return res.status(400).json({
          message: 'Offer Not avialable'
        });
      }
      else{
        const update= await Offer.updateOne({ _id: req.query._id}, { $set: { deleted: true } })
        res.redirect('/offer');
      }
  
    }catch (error) {
      console.error('Errorwhile  deleting offers:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
  
    }
  }

  async function editOffer(req, res) {

    try {
  
      const updatedOffer = await Offer.findOne({
        '_id': req.body._id
      })
  
      if (!updatedOffer) {
        return res.status(400).json({
          message: 'no such category avialable'
        });
      } else {
  
        const result = await Offer.updateOne({
          _id: req.body._id
        }, {
          $set: {
            offerName: req.body.offerName,
            DiscountValue: req.body.DiscountValue,
            offerStartDate: req.body.offerStartDate,
            offerType: req.body.offerType,
            offerEndDate: req.body.offerEndDate,
            offerDescription: req.body.offerDescription,
            bannerImage: req.file?.filename,
          }
        });
        
  
        console.log('Offer updated successfully');
        res.status(200).json({
          message: 'Offer updated successfully'
        });
      }
  
    } catch (error) {
      console.error('Errorwhile adding Offers:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
  
    }
  
  }
 
module.exports = {
    addNewOffer: addNewOffer,
    deleteOffer:deleteOffer,
    editOffer:editOffer,
};
