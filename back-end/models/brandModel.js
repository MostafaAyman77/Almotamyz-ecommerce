const mongoose = require("mongoose");

// 1-create Schema
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "brand required"],
        unique: [true, "brand must be unique"],
        minlength: [3, "Too short brand name"],
        maxlength: [32, "Too long brand name"],
    },
    slug: {
        type: String,
        lowercase: true
    },
    image: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
},
    { timestamps: true });

// 2- Create model
const BrandModel = mongoose.model("Brand", brandSchema);

module.exports = BrandModel;