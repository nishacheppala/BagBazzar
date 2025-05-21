const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const router = express.Router();
const productModel= require("../models/product-model");
const userModel = require("../models/user-model");
const mongoose  = require("mongoose");
const passport = require("passport");
const { generateToken } = require("../utils/generateToken");

router.get("/", function(req,res){
    let error = req.flash("error");
    res.render("index", {error,loggedin: false});
});

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  // Successful authentication, send the token to the client.
  let token = generateToken(req.user);
  res.cookie('token', token); // Store token in cookie
  res.redirect('/cart');
});


router.get("/shop", async function(req,res){
    let products = await productModel.find();
    var flag = false
    if(req.cookies.token){
      flag = true
  }

    res.render("shop",{products ,loggedin:flag})
})

router.get("/show/:id",async(req,res)=>{
    let {id} = req.params
    let product = await productModel.findOne({_id:id})
    res.render("showproduct",{product})
})

router.get("/profile",async(req,res)=>{

  var flag = false
  if(req.cookies.token){
    flag = true
}
    res.render("profile",{loggedin:flag})
})

router.get("/addtocart/:id",isLoggedIn,async (req,res)=>{
  try{
    let {email} = req.user
    let {id} = req.params
    let user = await userModel.findOne({email})//populate dusre route me karo yaha nhii
 
    let productId = new mongoose.Types.ObjectId(id)
 
    const itemIndex = user.cart.findIndex(item => item.productId.equals(productId));

        if (itemIndex > -1) {
            // Product already in cart, update the quantity
            user.cart[itemIndex].quantity += 1;
        } else {
            // Product not in cart, add a new item
            user.cart.push({ productId, quantity:1 });
        }
    await user.save();
    res.redirect("/cart")
      }
      catch(err){
        console.log("this user cannot do add to cart: ",err)
      }
})

router.get("/cart",isLoggedIn,async(req,res)=>{
  try{
    let {email} = req.user
    let user = await userModel.findOne({email}).populate('cart.productId')

    res.render("cart",{user})
  }
  catch(err){
    console.log("cart page is not able to load: ",err)
  }
})

router.get("/cart/checkout",isLoggedIn,async(req,res)=>{
  try{
    let {email} = req.user
    let user = await userModel.findOne({email}).populate('cart.productId')

    res.render("checkout",{user})
  }
  catch(err){
    console.log("cart page is not able to load: ",err)
  }
})

router.get("/delete/:_id", isLoggedIn, async (req, res) => {
    try {
      let { _id } = req.params;
      let { email } = req.user;
  
      // Find the user by email and remove the product from their cart
      let updatedUser = await userModel.findOneAndUpdate(
        { email: email }, // Find the user by email
        { $pull: { cart:{ productId: _id } } }, // Use $pull to remove the product from the cart array
        { new: true } // Return the updated user document
      );
  
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
  
      // Successfully updated the cart
      res.status(200).send("Product removed from cart");
    } catch (err) {
      console.error("Error removing product from cart:", err);
      res.status(500).send("Failed to remove product from cart");
    }
  });
  
module.exports = router;