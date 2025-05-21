const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const ownerModel = require("../models/owner-model")

module.exports =async function(req,res,next){
    if(req.cookies.token){
        try{
            let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            let user = await userModel
            .findOne({ email: decoded.email })
            .select("-password"); // Find user from userModel, excluding password

        if (!user) {
                                    // If user is not found in userModel, check ownerModel
        user = await ownerModel
            .findOne({ email: decoded.email })
            .select("-password"); // Find user from ownerModel, excluding password
                } // find a user by their email,but excluding the password
            res.locals.user = user;
            
        }
        catch (err) {
            // If token is invalid, just proceed without setting req.user
            res.locals.user = null;
        }
    } else {
        res.locals.user = null; // No token, no user info
        
    }
    next();
    }