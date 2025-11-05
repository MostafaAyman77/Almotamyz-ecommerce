const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
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
  { timestamps: true }
);

// Cascade delete subcategories when a category is deleted
categorySchema.pre("findOneAndDelete", async function (next) {
  const categoryId = this.getQuery()._id; // get ID from query
  if (categoryId) {
    await mongoose.model("SubCategory").deleteMany({ category: categoryId });
  }
  next();
});

const CategoryModel = mongoose.model("Category", categorySchema);
module.exports = CategoryModel;
