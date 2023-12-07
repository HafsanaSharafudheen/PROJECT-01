const Product = require('../../models/product');
const Category = require('../../models/Category')

async function addProducts(req, res) {
  try {
      // Check if the product name is a string
      if (isNaN(req.body.productName&&req.body.productDescription)) {
          if (!req.files) {
              return res.status(400).json({
                  message: 'Please upload an image'
              });
          }

          const newImageArray = req.files.map(x => {
              return {
                  imageUrl: x.path,
                  imageName: x.filename
              };
          });

          console.log(req.files.length, "images length------------------");
          const newProductNumber = await getLastProductNumber();

          const newProduct = new Product({
              productNumber: newProductNumber,
              productName: req.body.productName,
              productDescription: req.body.productDescription,
              productPrice: req.body.productPrice,
              productCategory: req.body.productCategory,
              productCoupon: req.body.productCoupon,
              brandName: req.body.brandName,
              stock: req.body.stock,
              productImages: newImageArray,
              date: new Date(),
          });

          await newProduct.save();
          return res.status(200).json({
              message: 'Product added successfully'
          });
      } else {
          // Product name is a number, return a 400 Bad Request
          return res.status(400).json({
              error: 'please check your details.'
          });
      }
  } catch (error) {
      console.error('Error while adding products:', error);
      return res.status(500).json({
          error: 'Internal server error'
      });
  }
}





const getLastProductNumber = async () => {
  const lastProduct = await Product.findOne().sort({
    productNumber: -1
  });
  return lastProduct ? lastProduct.productNumber + 1 : 1;
};

async function editProducts(req, res) {
 
  try {

    const updatedProduct= await Product.findOne({
      "productNumber":req.body.productNumber
    })

    if (!updatedProduct) {
      return res.status(400).json({
        message: 'no such Poduct available'
      });
    } else {
      let newImageArray = req.files.map(x => {
        return {
          imageUrl: x.path,
          imageName: x.filename
        }
      });
      
      newImageArray= [...newImageArray,...JSON.parse(req.body.productImages)];

      const result = await Product.updateOne({
        "productNumber":req.body.productNumber
      }, {
        $set: {
          "productNumber": req.body.productNumber,
          "productName": req.body.productName,
          "productDescription": req.body.productDescription,
          "productPrice": req.body.productPrice,
          "productCategory": req.body.productCategory,
          "productCoupon": req.body.productCoupon,
          "brandName": req.body.brandName,
          "stock": req.body.stock,
          "productImages": newImageArray,
          date: new Date(),
        }
      });
      console.log('Category updated successfully');
      res.status(200).json({
        message: 'Category updated successfully'
      });
    }

  } catch (error) {
    console.error('Errorwhile adding categories:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });

  }

}

async function deleteProduct(req,res){
  try{
    const productExists = await Product.findOne({
      'productNumber': req.query.productNumber
    })
    if(!productExists){
      return res.status(400).json({
        message: 'no such product avialable'
      });
    }
    else{
      const updateproduct= await Product.updateOne({ 'productNumber': req.query.productNumber}, { $set: { deleted: true } })
      res.redirect('/admin/adminProducts');
    }

  }catch (error) {
    console.error('Errorwhile deleting products:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });

  }
}



async function addCategory(req, res) {
  
  const categoryExists = await Category.findOne({
    'categoryName': req.body.categoryName
  })
  if (categoryExists) {
    return res.status(400).json({
      message: 'Category already exists'
    });
  } 

  const newCategory = new Category({
    "categoryImage":req.file?.filename,
    "categoryName": req.body.categoryName,
    "categoryDescription": req.body.categoryDescription,
    date: new Date(),
  });
  console.log('111')

  await newCategory.save()
  return res.status(200).json({
    message: 'category  added successful'
  })
}

async function editCategory(req, res) {

  try {

    const updatedCategory = await Category.findOne({
      '_id': req.body._id
    })
    console.log('1111')

    if (!updatedCategory) {
      return res.status(400).json({
        message: 'no such category avialable'
      });
    } else {

      const result = await Category.updateOne({
        _id: req.body._id
      }, {
        $set: {
          categoryImage:req.file?.filename,
          categoryName: req.body.categoryName,
          categoryDescription: req.body.categoryDescription,
          date: new Date()
        }
      });
      
      console.log('11111')

      console.log('Category updated successfully');
      res.status(200).json({
        message: 'Category updated successfully'
      });
    }

  } catch (error) {
    console.error('Errorwhile adding categories:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });

  }

}
async function deleteCategory(req,res){
  try{
    const categoryExists = await Category.findOne({
      '_id': req.query._id
    })
    if(!categoryExists){
      return res.status(400).json({
        message: 'no such category avialable'
      });
    }
    else{
      const update= await Category.updateOne({ _id: req.query._id}, { $set: { deleted: true } })
      res.redirect('/admin/adminCategories');
    }

  }catch (error) {
    console.error('Errorwhile  deleting categories:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });

  }
}




module.exports = {
  addProducts: addProducts,
  editProducts: editProducts,
  editCategory: editCategory,
  addCategory: addCategory,
  deleteCategory:deleteCategory,
  deleteProduct:deleteProduct,
}
