const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let publicId = `book_${Date.now()}`;

    if (req.params.id) {
      publicId = `book_${req.params.id}`;
    }

    return {
      folder: "books",
      public_id: publicId,
      overwrite: true,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 400, height: 500, crop: "fill" }],
    };
  },
});

const upload = multer({ storage }).single("image");

module.exports = { upload, cloudinary };
