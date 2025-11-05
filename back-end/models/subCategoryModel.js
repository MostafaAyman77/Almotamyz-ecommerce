const mongoose = require("mongoose");
const ApiError = require("../utils/apiError");

const subCategorySchema = new mongoose.Schema(
  {
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
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
  },
  { timestamps: true }
);

subCategorySchema.pre("save", async function (next) {
  const Category = mongoose.model("Category");
  const categoryExists = await Category.findById(this.category);
  if (!categoryExists) {
    return next(new ApiError("Category does not exist", 404));
  }
  next();
});

// Create model
const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategoryModel;
