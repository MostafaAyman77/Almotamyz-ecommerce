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
        unique: true,
    },
    description: {
        type: String,
        required: [true, "product description is required"],
        minlength: [20, "Too short product description"],
    },
    quantity: {
        type: Number,
        required: [true, "product quantity is required"],
        min: [0, "Quantity cannot be negative"],
    },
    sold: {
        type: Number,
        default: 0,
        min: [0, "Sold quantity cannot be negative"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        trim: true,
        min: [0, "Price cannot be negative"],
        max: [2000000, "Too long product price"],
    },
    priceAfterDiscount: {
        type: Number,
        min: [0, "Discounted price cannot be negative"],
        validate: {
            validator: function (value) {
                if (value) return value <= this.price;
                return true;
            },
            message: "Discounted price cannot be higher than original price"
        }
    },
    colors: [String],
    imageCover: {
        type: String,
        // required: [true, "Product image cover required"],
    },
    images: [String],
    subcategory: {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
        required: [true, "Product must be belong to a subcategory"],
    },
    brand: {
        type: mongoose.Schema.ObjectId,
        ref: "Brand",
        required : [true, "Product must be belong to a brand"],
    },
    ratingsAverage: {
        type: Number,
        min: [1, "Rating must be above or equal 1.0"],
        max: [5, "Rating must be below or equal 5.0"],
        default: 1
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// // Mongoose Query Middleware to exclude deleted products
// productSchema.pre(/^find/, function (next) {
//     this.where({ isDeleted: { $ne: true } });
//     next();
// });

productSchema.pre(/^find/, function (next) {
    this.populate({
        path: "subcategory",
        select: "name category",
        populate: {
            path: "category",
            select: "name"
        }
    }).populate({
        path: "brand",
        select: "name"
    });
    next();
});

// Index for better performance
productSchema.index({ slug: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isDeleted: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;