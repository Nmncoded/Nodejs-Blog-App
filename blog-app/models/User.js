var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt=  require('bcrypt');

var userSchema = new Schema({
    name : {type:String, required:true },
    email:{type:String,required:true},
    password:{type:String,minlength:5,required:true}
},{timestamps:true});

userSchema.pre('save', function(next){
    if(this.password && this.isModified('password') ){
        bcrypt.hash(this.password, 10, (err, hash) => {
            // Store hash in your password DB.
            // console.log(this);
            if(err) return next(err);
            this.password = hash;
            // console.log(this);
            return next();
        });
    }else{
        return next();
    }
});

userSchema.methods.verifyPassword = function(password,cb){
    bcrypt.compare(password,this.password,(err,result) => {
        return cb(err,result);
    })
}

module.exports = mongoose.model('User',userSchema);