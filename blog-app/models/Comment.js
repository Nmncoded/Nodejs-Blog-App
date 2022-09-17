var mongoose = require(`mongoose`);
var Schema = mongoose.Schema;

var commentSchema = new Schema(
  {
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId , ref : "User" }] ,
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required:true },
    author :{ type: Schema.Types.ObjectId , ref : "User" , required:true }
  },
  { timestamps: true }
);

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;