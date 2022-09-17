var express = require('express');
const passport = require('passport');
const User = require('../models/User');
var router = express.Router();

/* GET home page. */
// console.log("inside !!!")
router.get('/', function(req, res, next) {
  console.log(req.session, res.locals, req.user);
  res.render('index', { title: 'Express', welcome : req.user ? 'user logged in !!!' : "" });
});

router.get('/login',(req,res,next) => {
  return res.render('login');
})

router.post('/login',(req,res,next) => {
  const { email,password } = req.body;
  if(!email || !password ){
    req.flash('ep','Both field required.');
    console.log('Both field required.')
    return res.redirect('/login');
  }
  User.findOne({email},(err,user) => {
    if(err) return next(err);
    if(!user){
    req.flash('email','use not found');
      console.log('user not found.')
      return res.redirect('/login');
    }
    user.verifyPassword(password,(err,result) => {
      if(err) return next(err);
      if(!result){
      req.flash('password','password not correct !!!');
      console.log('password not correct !!!')
      return res.redirect('/login');
      }
      // res.send("welcome");
      req.session.userId = user.id;
      // console.log(req.session);
      return res.redirect('/')
    })
  })
  // res.render('login')
})

router.get('/register',(req,res,next) => {                    
  res.render('register');
})
router.post('/register',(req,res,next) => {
  // console.log(req.body);
  User.create(req.body,(err,user) => {
    if(err) return next(err);
    return res.redirect('/login');
  })
  // res.render('register');
})

router.get('/logout',(req,res,next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  return res.redirect('/');
});


router.get('/auth/github',passport.authenticate('github', { scope: [`user:email`] }));

router.get('/auth/google',
  passport.authenticate('google', { scope: [`profile`,'email'] }));

router.get('/auth/github/callback',passport.authenticate('github',{failureRedirect:'/login' }),(req,res) => {
  return res.redirect('/');
});


router.get(
  '/login/oauth2/google',passport.authenticate('google', { failureRedirect: '/login'}),
  (req, res) => {
  // Successful authentication, redirect home.
  console.log('inside');
  return res.redirect('/');
});

module.exports = router;
