const Offer = require('../models/offer');


async function addNewOffer(req, res) {
    try {
        console.log(req.file,'------------')
        console.log(req.body,'requestbody')
        const offerExists = await Offer.findOne({
            'offerName': req.body.offerName
          })
          if (offerExists) {
            return res.status(400).json({
              message: 'Offer already exists'
            });
          } 
        console.log('11111111111111111111111111111111111')
        const newOffer = new Offer({
            offerName: req.body.offerName,
            DiscountValue: req.body.DiscountValue,
            offerStartDate: req.body.offerStartDate,
            offerType: req.body.offerType,
            offerEndDate: req.body.offerEndDate,
            offerDescription: req.body.offerDescription,
            bannerImage: req.file?.filename,
        });
console.log(newOffer,"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn")
        // Save the new offer
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


module.exports = {
    addNewOffer: addNewOffer,
};
