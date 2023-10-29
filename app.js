var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
require('./server/models/databse');

var userRouter = require('./server/routes/userlogin');
var homeRouter = require('./server/routes/home');
var signupRouter = require('./server/routes/signup'); 

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


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
