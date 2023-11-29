const Order = require('../models/order');
const Product=require('../models/product')
const Category=require('../models/Category')

function calculateDate(selectedDate){
  console.log(selectedDate,'selecteddate')
      let startDate;
      if (selectedDate === "1") {
        startDate = new Date();}
      else if (selectedDate === "30") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      } else if (selectedDate === "7") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (selectedDate === "365") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
      } else {
        return res.status(400).json({ error: 'Invalid selectedDate' });
      }
      return startDate;
  
}
async function chart(req, res) {
  try {
    const selectedDate = req.query.selectedValue;
    const startDate = calculateDate(selectedDate);

    const salesData = await Order.aggregate(
      [
        {
          $match: {
            date: { $gte: startDate },
          },
        },
        {
          $unwind: {
            path: "$orderProducts",
          },
        },
        {
          $group: {
            _id: {
              orderStatus: "$orderProducts.orderStatus",
              deliveryStatus: "$orderProducts.deliveryStatus",
            },
            count: { $sum: 1}
          },
        },
      ]
      
      );
    console.log(salesData,"salesadata")
    
    let labels=salesData.map(order=>order._id.deliveryStatus?order._id.deliveryStatus: order._id.orderStatus).sort();
    
    let count=salesData.map(x=>x.count)
    console.log(labels,"labels")
    console.log(count,"count")

    // Add more specific error handling or logging if needed

    if (salesData.length === 0) {
      return  res.status(200).json({count:count,labels:labels,salesData:salesData});
    } else {
    return  res.status(200).json({count:count,labels:labels,salesData:salesData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
async function categoryChart(req, res) {
  try {
    const selectedDate = req.query.selectedValue;
    const startDate = calculateDate(selectedDate);

    const salesData = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "categoryName",
          foreignField: "productCategory",
          as: "products",
        },
      },
    
      {
        $project: {
          categoryName: "$categoryName",
          product_id: "$products._id",
           product_idString: {
            $map: {
              input: "$products",
              as: "product",
              in: { $toString: "$$product._id" }
            }
          }
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "product_idString",
          foreignField: "orderProducts.product_id",
          as: "orders",
        },
      }, 
      {
         $project: {
          categoryName: "$categoryName",
          product_id: "$product_id",
            sales: { $size: "$orders" }
         }
      }
      
    ]
    );
    
    console.log(salesData);
    
    
    
    const labels = salesData.map(x => x.categoryName ).sort();
    const count = salesData.map(x => x.sales).sort();
    console.log(salesData, "salesData");

    console.log(labels, "labels");
    console.log(count, "count");
    

    // Add more specific error handling or logging if needed

    if (salesData.length === 0) {
      return  res.status(200).json({count:count,labels:labels });
    } else {
    return  res.status(200).json({count:count,labels:labels });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



module.exports = {
  chart:chart,
  categoryChart:categoryChart
};

