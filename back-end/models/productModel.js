const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Too short product title"],
        maxlength: [100, "Too long product title"],
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: [true, "product description is required"],
        minlength: [20, "Too short product description"],
    },
    quantity: {
        type: Number,
        required: [true, "product quantity is required"],
    },
    sold: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        trim: true,
        max: [2000000, "Too long product price"],
    },
    priceAfterDiscount: {
        type: Number,
    },
    colors: [String],

    imageCover: {
        type: String,
        required: [true, "Product image cover required"],
    },
    images: [String],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, "Product must be belong to category"],
    },
    subcategory: [{
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
    }],
    brand: {
        type: mongoose.Schema.ObjectId,
        ref: "Brand",
    },
    ratingsAvarage: {
        type: Number,
        min: [1, "Rating must be above or equal 1.0"],
        max: [5, "Rating must be bellow or equal 5.0"],
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    }
},
    { timestamps: true }
);

// Mongoose Query Middleware
productSchema.pre(/^find/, function(next) {
    this.populate({
        path: "category",
        select: "name"
    });
    next();
});

module.exports = mongoose.model("Product", productSchema);