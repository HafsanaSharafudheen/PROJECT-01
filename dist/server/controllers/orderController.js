const Order = require('../models/order');
const Product = require('../models/product');
async function cancelOrder(req, res) {
  try {
    const orderExists = await Order.findOne({
      '_id': req.body._id
    });
    if (!orderExists) {
      return res.status(400).json({
        message: 'no such order avialable'
      });
    } else {
      const update = await Order.findOneAndUpdate({
        "_id": req.body._id,
        "orderProducts.product_id": req.body.product_id
      }, {
        $set: {
          "orderProducts.$.orderStatus": "Cancelled"
        }
      });
      return res.status(200).json({
        message: 'order cancelled Successfully'
      });
    }
  } catch (error) {
    console.error('Errorwhile deleting orders:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function viewOrderPage(req, res) {
  try {
    // Fetch orders for the user
    const orders = await Order.find({
      "user_id": req.userDetails.user_id
    });
    // Flatten orderProducts and extract relevant information
    const result = orders.flatMap(order => order.orderProducts.map(x => ({
      orderStatus: x.orderStatus,
      amount: x.amount,
      deliveryStatus: x.deliveryStatus,
      product_id: x.product_id,
      orderid: order._id
    })));

    // Use the productIds to fetch product details
    const productIds = result.map(x => x.product_id);
    const products = await Product.find({
      "_id": {
        $in: productIds
      }
    });

    // Match products with result
    for (let i = 0; i < result.length; i++) {
      const product = products.find(x => x._id == result[i].product_id);
      if (product) {
        result[i].productImage = product.productImages[0].imageName;
        result[i].productName = product.productName;
        result[i].productCategory = product.productCategory;
      }
    }
    res.render('orderPage', {
      orders: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
}
module.exports = {
  cancelOrder: cancelOrder,
  viewOrderPage: viewOrderPage
};