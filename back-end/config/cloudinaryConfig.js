const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: "auto",
        transformation: [
          { width: 2000, height: 1333, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    // Convert buffer to stream and pipe to Cloudinary
    const Readable = require("stream").Readable;
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// Helper function to delete multiple images from Cloudinary
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Error deleting multiple images from Cloudinary:", error);
    throw error;
  }
};

// Helper function to delete folder from Cloudinary
const deleteFolderFromCloudinary = async (folderPath) => {
  try {
    // First, delete all resources in the folder
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 500
    });
    
    if (resources.resources.length > 0) {
      const publicIds = resources.resources.map(resource => resource.public_id);
      await cloudinary.api.delete_resources(publicIds);
    }
    
    // Then delete the folder itself
    await cloudinary.api.delete_folder(folderPath);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting folder from Cloudinary:", error);
    throw error;
  }
};

// Extract public_id from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/products/productId/image.jpg
  const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : null;
};

// Export all functions and cloudinary instance
module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  deleteFolderFromCloudinary,
  extractPublicId
};