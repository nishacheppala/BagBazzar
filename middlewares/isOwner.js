const ownerModel = require("../models/owner-model");
const jwt = require("jsonwebtoken")


module.exports = async function(req, res, next) {
  if(!req.cookies.token){
    req.flash("error","you need to login first on owners route")
    return res.redirect("/")
}
try{
  let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
  let owner = await ownerModel
      .findOne({email:decoded.email}).select("-password") // find a user by their email,but excluding the password
  if(!owner){ req.flash("error"); return res.redirect("/shop");}
  req.owner = owner;
  
  next();
}
catch{
  req.flash("error","something went wrong during decoding!!")
  res.redirect("/");
}
}
