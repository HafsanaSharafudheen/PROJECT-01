const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
 
  bannerImage:{
      type:String,
      required:true
  },

  offerStartDate: {
    type: Date,
    required: true,
},  
offerEndDate: {
    type: Date,
    required: true,
}, 
offerType:{
    type:String,
    required:true,
},
DiscountValue: {
    type: Number,
    required: true,
}, 
offerName: {
    type: String,
    required: true,
}, 
offerDescription: {
    type: String,
    required: true,
},

});

const offer = mongoose.model('offer', offerSchema);

module.exports = offer;
