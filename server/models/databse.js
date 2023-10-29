const mongoose = require('mongoose');

//mongodb connection
mongoose.connect('mongodb://localhost:27017/babybundles',{    
  useNewUrlParser:true,
  useUnifiedTopology:true, 

})
const db=mongoose.connection;
db.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('MongoDB connected successfully');
});

require('./userdb');
require('./otpcollection')
