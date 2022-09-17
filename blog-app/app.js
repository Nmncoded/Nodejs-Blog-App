var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const passport = require('passport');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var flash = require('connect-flash');
var session = require('express-session');
require('dotenv').config();

const auth = require('./middlewares/auth.js');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require("./routes/article");
var commentsRouter = require("./routes/comment");
const mongoose  = require('mongoose');
const MongoStore = require('connect-mongo');

// connect to database
mongoose.connect('mongodb://127.0.0.1/login-with-flash',{
  useNewUrlParser: true,
  useUnifiedTopology:true,
},
(err) => console.log(err ? err : "connected !!!")
)

require('./modules/passport.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
// console.log(process.env);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SECRET ,
  saveUninitialized: false ,
  resave:false ,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1/login-with-flash' ,
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(auth.userInfo);

app.use((req,res,next) => {
  // console.log(req.user);
  // console.log(res.locals.user);
  return next()
})

app.use('/', indexRouter);
app.use("/articles", articlesRouter);
app.use("/comments", commentsRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
