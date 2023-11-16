const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
     required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
},
categoryDescription: {
    type: String,
     required: true,
},
deleted: { type: Boolean,
     default: false }, 

});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
