const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
    fullname: {
        type:String,
        minLength: 3,
        trim:true,
    },
    googleId: String,
    email:String,
    password: String,
    products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
}],
    isadmin: {
        type: Boolean,
        default: true
    },
    picture:String,
    gstin:String,
})

module.exports = mongoose.model("owner", ownerSchema)