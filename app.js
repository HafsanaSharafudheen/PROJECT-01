var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
require('./server/models/databse');
const multer = require('multer');


var userRouter = require('./server/routes/userlogin');
var homeRouter = require('./server/routes/home');
var signupRouter = require('./server/routes/signup'); 
var adminRouter=require('./server/routes/admin');
var uploadRouter=require('./server/routes/upload')
var cartPageRouter=require('./server/routes/cartPage');
var profileRouter=require('./server/routes/profile');
var orderRouter=require('./server/routes/order');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



// session
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, 'public')));




app.use('/', userRouter);
app.use('/home', homeRouter);
app.use('/signup', signupRouter);
app.use('/admin',adminRouter);
app.use('/fileupload',uploadRouter);
app.use('/cartPage',cartPageRouter);
app.use('/profile',profileRouter);
app.use('/order',orderRouter);
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
