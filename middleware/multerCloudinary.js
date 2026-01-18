const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "books",
    format: "webp",
    transformation: [
      { width: 400, height: 500, crop: "fill", quality: "auto" },
    ],
  },
});

module.exports = multer({ storage }).single("image");
