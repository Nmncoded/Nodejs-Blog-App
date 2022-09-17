var express = require("express");
var router = express.Router();
var Article = require("../models/article");
var Comment = require(`../models/comment`);
var slug = require('slug');
var auth =  require('../middlewares/auth');
/* GET users listing. */

router.get("/", (req, res, next) => {
  // console.log(req.user);
  Article.find({}, (err, articles) => {
    if (err) return next(err);
    // res.json({articles})
    res.render("allArticles", { articles: articles });
  });
});

router.get(`/:slug`, (req, res, next) => {
  // console.log(req.session);
  // if(!req.session.userId) return res.redirect('/login');
var {slug} = req.params;
Article.findOne({slug})
  .populate(`comments`)
  .populate(`author`)
  .exec((err, article) => {
    if (err) return next(err);
    console.log(article);
    res.render(`singleArticle`, { article, msg : "" });
  });
});

// check authorisation
router.use(auth.isUserLogged); // check first

router.get("/new/article", (req, res) => {
    // if(!req.session.userId) return res.redirect('/login');
    const msg = req.flash('slug-exist')[0];
  res.render("addArticles",{msg});
});

router.post("/", (req, res, next) => {
  req.body.author = req.user.id;
  var data = req.body;
  var slg = slug(data.title);
    Article.findOne({slug:slg},(err,result) => {
    if(err) return next(err);
       if(result){
        req.flash('slug-exist','title already exist !!!');
        return res.redirect('/articles/new/article'); 
       }else{
        data.slug = slg;
        data.tags = data.tags.split(',')
          Article.create(data, (err, articleCreated) => {
            if (err) return next(err);
            // console.log(articleCreated);
            return res.redirect("/articles");
          });
       } 
    })
});

router.get("/:id/edit", (req, res, next) => {
    // if(!req.session.userId) return res.redirect('/login');
  var id = req.params.id;
  Article.findById(id).populate(`author`).exec((err,article) => {
    if (err) return next(err);
    const msg = req.flash('slug-exist')[0];
    console.log(article.author.equals(req.user.id) );
    if(article.author.equals(req.user.id)){
      return res.render("updateArticle", { article: article, msg });
    }else{
      req.flash('not-authorized','only owner can do edit !!!');
      const msg = req.flash('not-authorized')[0];
      // console.log(msg,article);
      return res.render(`singleArticle`, { article, msg });
    }
  })
});

router.post("/:id", (req, res, next) => {
  var id = req.params.id;
  req.body.author = req.user.id;
  var data = req.body;
  var slg= slug(data.title);
  Article.findOne({slug:slg},(err,result) => {
    if(err) return next(err);
    if(result){
     req.flash('slug-exist','title already exist !!!');
     return res.redirect('/articles/'+id+'/edit'); 
    }else{
     data.slug = slg;
     data.tags = data.tags.split(',')
       Article.findByIdAndUpdate(id,data, {new:true} , (err, updatedArticle) => {
         if (err) return next(err);
        //  console.log(updatedArticle);
         return res.redirect("/articles/"+updatedArticle.slug);
       });
    } 
    })
});

router.get("/:id/delete", (req, res, next) => {
    // if(!req.session.userId) return res.redirect('/login');
  var id = req.params.id;
  Article.findById(id).populate(`author`).exec((err,article) => {
    if(err) return next(err);
    if(article.author.equals(req.user.id)){
      Article.findByIdAndDelete(id, (err, deletedArticle) => {
        if (err) return next(err);
        Comment.remove({ articleId: deletedArticle.id }, (err) => {
          if (err) return next(err);
          return res.redirect("/articles");
        });
      });
    }else{
      req.flash('not-authorized','only owner can do edit !!!');
      const msg = req.flash('not-authorized')[0];
      // console.log(msg,article );
      return res.render(`singleArticle`, { article, msg });
    }
  })
});

router.get("/:id/increment", (req, res, next) => {
  var id = req.params.id;
  Article.findById(id,(err,article) => {
    if(err) return next(err);
    if(article.likes.length<1 || !article.likes.some(like => like.equals(req.user.id) ) ){
      Article.findByIdAndUpdate(id,{$push:{likes : req.user.id }},{new:true},(err,result) => {
        if (err) return next(err);
        // console.log(result);
        return res.redirect("/articles/" + result.slug);
      })
    }else{
      Article.findByIdAndUpdate(id,{$pull:{likes : req.user.id }},{new:true},(err,result) => {
        if (err) return next(err);
        return res.redirect("/articles/" + result.slug);
      })
    }
  })
});

// router.get("/:id/decrement", (req, res, next) => {
//     // if(!req.session.userId) return res.redirect('/login');
//   var id = req.params.id;
//   Article.findById(id,(err,result) => {
//     if(err) return next(err);
//     if(result.likes>0){
//         Article.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, likeDecre) => {
//           if (err) return next(err);
//           return res.redirect("/articles/" + result.slug);
//       })
//     }else{
//         return res.redirect('/articles/'+result.slug);
//     }
//   });
// });

router.post(`/:id/comments`, (req, res, next) => {
  var id = req.params.id;
  var data = req.body;
  data.articleId = id;
  data.author = req.user.id;
  Comment.create(data, (err, comments) => {
    // console.log(comments);
    if (err) return next(err);
    Article.findByIdAndUpdate(
      id,
      { $push: { comments: comments.id } },
      (err, article) => {
        if (err) return next(err);
        return res.redirect(`/articles/` + article.slug);
      }
    );
  });
});

module.exports = router;