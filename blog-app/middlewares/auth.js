const User = require("../models/User");

module.exports = {
    isUserLogged: (req, res, next) => {
      let found = (req.session && req.session.userId) || ( req.session && req.session.passport && req.session.passport.user ) ;
      if (found) {
        return next();
      } else {
        return res.redirect("/login");
      }
    },
    userInfo : (req,res,next) => {
      let userId = (req.session && req.session.userId) || ( req.session && req.session.passport && req.session.passport.user ) ;
      if(userId){
        User.findById(userId,"name email",(err,user) => {
         if(err) return next(err);
         req.user = user;
         res.locals.user = user;
         return next();
        })
      }else{
        req.user = null;
        res.locals.user = null;
        return next();
      }
    }
	};