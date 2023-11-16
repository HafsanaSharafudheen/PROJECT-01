const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  password: {
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
  isBlocked: {
    type: Boolean,
    default: false, // Initially, users are not blocked
  },
date:{
  type:Date,
   required:true,
},
profileImage: {
  type: String, 
},

},{collection:"User"});

module.exports =  mongoose.model('User', UserSchema)

