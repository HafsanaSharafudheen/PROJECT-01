const Category = require('../../models/Category');
async function getAllCategories(req, res) {
  try {
    const categories = await Category.find({});

    // Render the 'adminProducts' view with the products data
    res.render('adminCategories', {
      categories: categories
    });
  } catch (error) {
    console.error('Error while fetching categories:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function getCategoryBycategoryid(req, res) {
  try {
    const category = await Category.findOne({
      "_id": req.body._id
    });
    if (!category) {
      return res.status(400).json({
        message: "No category available"
      });
    } else {
      return res.status(200).json({
        data: category
      });
    }
  } catch (error) {
    console.error('Error while fetching category:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
module.exports = {
  getAllCategories: getAllCategories,
  getCategoryBycategoryid: getCategoryBycategoryid
};