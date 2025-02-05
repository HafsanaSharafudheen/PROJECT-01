const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.CONNECTIONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', err => {
  console.error('MongoDB connection error:', err);
});
db.once('open', () => {
  console.log('MongoDB connected successfully');
});
require('./userdb');
require('./otpcollection');