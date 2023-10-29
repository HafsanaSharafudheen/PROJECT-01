const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
 
  admin: {
    type: Boolean,
    required: true,
  },
  email:{
type:String,
required:true,
match: /^\S+@\S+\.\S+$/
  },
  
date:{
  type:Date,
   required:true,
}
},{collection:"User"});

module.exports =  mongoose.model('User', UserSchema)

