const cloudinary = require("cloudinary").v2;
const Book = require("../models/Book");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteImageCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  const publicId = imageUrl.split("/").pop().split(".")[0];
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Image Cloudinary ${publicId} supprimée`);
  } catch (err) {
    console.error("Erreur suppression image Cloudinary:", err.message);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (book.imageUrl) await deleteImageCloudinary(book.imageUrl);

    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Livre et image supprimés !" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.modifyBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const bookObject = req.file
      ? { ...JSON.parse(req.body.book), imageUrl: req.file.path }
      : { ...req.body };

    if (req.file && book.imageUrl) {
      await deleteImageCloudinary(book.imageUrl);
    }

    await Book.updateOne({ _id: req.params.id }, bookObject);
    res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
