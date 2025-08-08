const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: [true, "SubCategory must be unique"],
        minlength: [2, "To short subCategory name"],
        maxlength: [32, "To long subCategory name"],
    },
    slug: {
        type: String,
        lowercase: true,
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, "SubCategory must be belong to parent category"],
    } ,
},
{timestamps: true}
);

// Create model
const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategoryModel;