var express = require(`express`);
const auth = require("../middlewares/auth");
var router = express.Router();
var Article = require(`../models/article`);
var Comment = require(`../models/comment`);

router.use(auth.isUserLogged);

router.get(`/:id/edit`, (req, res) => {
    // if(!req.session.userId) return res.redirect('/login');
  var id = req.params.id;
  // Comment.findById(id, (err, comment) => {
  //   if (err) return next(err);
  //   res.render(`updateComment`, { comment });
  // });
  Comment.findById(id).populate(`author`).exec((err,comment) => {
    if (err) return next(err);
    // const msg = req.flash('slug-exist')[0];
    console.log(comment.author.equals(req.user.id) );
    if(comment.author.equals(req.user.id)){
      return res.render("updateComment", { comment , msg :""});
    }else{
      req.flash('not-authorized','only owner can edit comment !!!');
      const msg = req.flash('not-authorized')[0];
      // console.log(msg,article);
      Article.findById(comment.articleId)
      .populate(`comments`)
      .populate(`author`)
      .exec((err, article) => {
        if (err) return next(err);
        // console.log(article);
        res.render(`singleArticle`, { article, msg  });
      });
    }
  })
});

router.post(`/:id`, (req, res, next) => {
    // if(!req.session.userId) return res.redirect('/login');
  var id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body,{new:true}, (err, updatedComment) => {
    if (err) return next(err);
    // console.log(updatedComment);
    Article.findById(updatedComment.articleId,(err,result) => {
    if (err) return next(err);
    return res.redirect(`/articles/` + result.slug);
    })
  });
});

router.get(`/:id/delete`, (req, res, next) => {
    // if(!req.session.userId) return res.redirect('/login');
  var id = req.params.id;
  Comment.findById(id).populate(`author`).exec((err,comment) => {
    if(err) return next(err);
    if(comment.author.equals(req.user.id)){
      Comment.findByIdAndDelete(id, (err, deletedComment) => {
        if (err) return next(err);
        Article.findByIdAndUpdate(
          deletedComment.articleId,
          {
            $pull: { comments: deletedComment.id },
          },
          (err, article) => {
            if (err) return next(err);
            res.redirect(`/articles/` + article.slug );
          }
        );
      });
    }else{
      req.flash('not-authorized','only owner can delete comment !!!');
      const msg = req.flash('not-authorized')[0];
      // console.log(msg,article );
      Article.findById(comment.articleId)
      .populate(`comments`)
      .populate(`author`)
      .exec((err, article) => {
        if (err) return next(err);
        // console.log(article);
        res.render(`singleArticle`, { article, msg  });
      });
    }
  })
});

router.get(`/:id/likes`, (req, res, next) => {
    // if(!req.session.userId) return res.redirect('/login');
  var id = req.params.id;
  // Comment.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, like) => {
  //   if (err) return next(err);
  //   Article.findById(like.articleId,(err,result) => {
  //   if (err) return next(err);
  //   return res.redirect("/articles/" + result.slug);
  //   })
  // });
  Comment.findById(id,(err,comment) => {
    if(err) return next(err);
    if(comment.likes.length<1 || !comment.likes.some(like => like.equals(req.user.id) ) ){
      Comment.findByIdAndUpdate(id,{$push:{likes : req.user.id }},{new:true},(err,like) => {
        if (err) return next(err);
        // console.log(result);
        Article.findById(like.articleId,(err,result) => {
        if (err) return next(err);
        return res.redirect("/articles/" + result.slug);
        })
      })
    }else{
      Comment.findByIdAndUpdate(id,{$pull:{likes : req.user.id }},{new:true},(err,like) => {
        if (err) return next(err);
        Article.findById(like.articleId,(err,result) => {
        if (err) return next(err);
        return res.redirect("/articles/" + result.slug);
        })
      })
    }
  })
});

module.exports = router;