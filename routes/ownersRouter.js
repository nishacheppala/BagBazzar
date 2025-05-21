const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owner-model")
const {hashed} = require("../utils/hash")
const {generateToken} = require("../utils/generateToken")
const bcrypt = require("bcrypt")
// const isLoggedIn = require("../middlewares/isLoggedIn")
const isOwner = require("../middlewares/isOwner");
const productModel = require('../models/product-model');

router.get("/", function(req,res){
    let error = req.flash("error");
    res.render("owner-login2",{error,loggedin: false})
});

// console.log('NODE_ENV:', process.env.NODE_ENV);
// if(process.env.NODE_ENV === "development"){ //ye environment based routing hai ,means ye route jo hai wo production me nhi chalega sirf development me chalega
    router.post("/create",async function(req, res){
        try{
            let {fullname, email, pass} = req.body
            let owners = await ownerModel.findOne({email});
            console.log(owners)
            //agr user hai or uska pass null hai to uska pass update karo 
            if(owners && owners.password===undefined){
                let password = await hashed(pass)
                await ownerModel.updateOne({email:owners.email},{$set:{password:password,fullname:fullname}})
                req.flash("error","You can login!")
                return res.redirect("/owners");
            }
            if(owners){
                req.flash("error","You Already have an account , please login !")
                return res.redirect("/owners");
                    }
                    let passw = await hashed(pass)
                    let owner = await ownerModel.create({
                        email,
                        password:passw,
                        fullname,
                    });
                    let token = generateToken(owner);
                    res.cookie("token",token);
                    req.flash("error","owner Created Successfully !");
                    return res.redirect("/owners");
            } catch(err){
                res.send(err.message);
            }

    })
// };

router.get("/admin" ,isOwner, function (req,res){
    let success = req.flash("success")
    res.render("createproducts",{success})
})

router.get("/admin/products",isOwner,async function (req,res){
    // let success = req.flash("success")
    // let user = await req.owner.populate('products')
    let products = await productModel.find()
    res.render("admin",{products})
})


router.post("/login",async function(req, res){
    let {email,password} = req.body;
    console.log(email,password)
    let owner = await ownerModel.findOne({email}); //use findone instead of find , otherwise user.password won't work
    
    if(!owner) {
        req.flash("error","Email or password is invalid !");
        return res.redirect("/owners");
    } 
    bcrypt.compare(password, owner.password, function(err, result) {
        if(result){
            let token = generateToken(owner)
            res.cookie("token",token)
            // req.user = user
            return res.redirect("/owners/admin")
        }
        req.flash("error","Invalid email or password!!"); //it takes 2 inputs ,1st msg name 2nd msg itself
        return res.redirect("/owners");
    });
})


// router.post("/register",registerowner);

// router.post("/login" , loginowner)

// router.get("/logout",isLoggedIn,logoutUser)

module.exports = router;