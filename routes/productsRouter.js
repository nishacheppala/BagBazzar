const express = require('express');
const router = express.Router();
const upload = require("../config/multer-config")
const productModel = require("../models/product-model");

const isOwner = require('../middlewares/isOwner');
const { render } = require('ejs');

router.post("/create",isOwner,upload.single("image"),async function(req,res){

    try{    
    let {name,price, discount, bgcolor, panelcolor , textcolor} = req.body;

    let product = await productModel.create({
        image: req.file.buffer,
        name,
        price,
        discount,
        bgcolor,
        panelcolor,
        textcolor,
    });
    req.flash("success","product created successfully")
    // req.owner.products.push(product._id)
    // req.owner.save()
    res.redirect("/owners/admin");
    } catch(err){
        res.send(err.message,"cannot able to create product");
    }
});


router.post("/edit/:_id",isOwner,upload.single("image"),async function(req,res){
    try{    
    let _id = req.params;
    let {name,price, discount, bgcolor, panelcolor , textcolor} = req.body;
    await productModel.findOneAndUpdate({_id:_id},{
        image: req.file.buffer,
        name:name,
        price:price,
        discount:discount,
        bgcolor:bgcolor,
        panelcolor:panelcolor,
        textcolor:textcolor,
    },{new:true});
    // console.log(product)
    req.flash("success","product updated successfully")
    res.redirect("/owners/admin");
    } catch(err){
        res.send(err.message,"cannot able to update product");
    }
});

router.get("/edit/:_id",isOwner,async function(req,res){
    let {_id} = req.params
    product = await productModel.findOne({_id})
    let success = 0
    // console.log(product)
    res.render("editproduct",{product,success})
})


router.get("/", function(req,res){
    res.send("hey it's working")
});

module.exports = router;