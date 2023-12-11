 const Order=require('../../models/order')
 const Product = require('../../models/product')
 const User=require('../../models/userdb');
 const mongoose = require('mongoose');


  async function adminOrders(req,res){
  var orders = await Order.find({})
  var users=await User.find({})
  console.log(orders)

  // Use the productIds to fetch product details
  console.log(products, "products")
  var result = orders.flatMap(order => order.orderProducts.map(x => ({
    orderStatus: x.orderStatus,
    amount: x.amount,
    DeliveryDate: x.DeliveryDate,
    deliveryStatus:x.deliveryStatus,
    product_id: x.product_id,
    date:order.date,
    orderid: order._id,
    paymentMethod:order.paymentMethod
  })));
  console.log(result)
  const productIds = result.map(x => {
    return x.product_id
  })
  var products = await Product.find({
    "_id": {
      $in: productIds
    }
  });
  var userIds = orders.map(order => order.user_id);

  console.log(userIds, "user IDs");
  
 var userDetails = await User.find({
  "_id": {
    $in: userIds.map(userId => new mongoose.Types.ObjectId(userId))
  }
});
  console.log(userDetails, "user details");
  
  for (let i = 0; i < result.length; i++) {
    var product = products.find(x => x._id == result[i].product_id);
     var user = userDetails.find(x => x.fullName);
    if (product) {
      result[i].productImage = product.productImages[0].imageName;
      result[i].productName = product.productName;
      result[i].productCategory = product.productCategory;
      result[i].productPrice = product.productPrice;
      result[i].stock=product.stock;
result[i].fullName=user.fullName;
result[i].email=user.email;
    }
  }
  res.render('adminOrders',{orders:result,userDetails:userDetails});
}



 async function shipOrders(req,res){
    console.log(req.body) 

    try {
        const updateResult = await Order.updateOne(
            {
              "_id": req.body.orderid,
              "orderProducts.product_id": req.body.product_id
            },
            {
              $set: { "orderProducts.$.orderStatus": "shipped" }
            }
          );
            
      
  
        res.status(200).json({message: 'Order shipped.' });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  
  
}


async function deliveryOrder(req,res){
    console.log(req.body) 

    try {
        const updateResult = await Order.updateOne(
            {
              "_id": req.body.orderid,
              "orderProducts.product_id": req.body.product_id
            },
            {
              $set: { "orderProducts.$.deliveryStatus": "delivered" }
            }
          );
            
      
  
        res.status(200).json({message: 'Order delivered.' });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  
  
}

module.exports={adminOrders:adminOrders,
    shipOrders:shipOrders,
    deliveryOrder:deliveryOrder
}