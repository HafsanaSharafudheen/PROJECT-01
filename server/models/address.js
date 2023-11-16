const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
  fullName: {
    type: String,
    required:true
},
  address: {
    type: String,
    required:true
},
  pincode: {
    type: Number,    
required:true

},
landmark: {
    type: String,
    required: true,
},  
city: {
    type: String,
    required: true,
},
  state: {
    type: String,
    required: true,
},  
mobile:
 { type: Number,
   required:true}, 


});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
