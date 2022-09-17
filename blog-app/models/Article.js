var mongoose = require(`mongoose`);
// var slug = require('slug');

var Schema = mongoose.Schema;

var articleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [String],
    likes: [{ type: Schema.Types.ObjectId, ref : "User", default : [] }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    slug:{type : String, unique:true },
    author : {type: Schema.Types.ObjectId, required:true, ref: "User"}
},
  { timestamps: true }
);

// articleSchema.pre('save', function(next) {
    
//     next();
// });

var Article = mongoose.model(`Article`, articleSchema);

module.exports = Article;