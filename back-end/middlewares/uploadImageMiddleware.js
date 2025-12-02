const multer = require("multer");

// Multer memory storage for processing with Sharp and uploading to Cloudinary
const multerMemoryStorage = multer.memoryStorage();

// File filter to accept only images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Upload single image
exports.uploadSingleImage = (fieldName) =>
  multer({
    storage: multerMemoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }).single(fieldName);

// Upload mix of images (for products: imageCover + images array)
exports.uploadMixOfImages = (arrayOfFields) =>
  multer({
    storage: multerMemoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }).fields(arrayOfFields);

// Upload array of images
exports.uploadArrayOfImages = (fieldName, maxCount) =>
  multer({
    storage: multerMemoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }).array(fieldName, maxCount);