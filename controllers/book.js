const Book = require("../models/Book");
const fs = require("fs").promises;

const calcAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((total, r) => total + r.grade, 0);
  return parseFloat((sum / ratings.length).toFixed(2));
};

const deleteImage = async (imageUrl) => {
  try {
    const filename = imageUrl.split("/images/")[1];
    await fs.unlink(`images/${filename}`);
  } catch (err) {
    console.error("Erreur suppression image:", err);
  }
};

exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const initialRating = bookObject.ratings?.[0]?.grade || 0;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename.split(".")[0]}optimized.webp`,
      averageRating: initialRating,
    });

    await book.save();
    res.status(201).json({ message: "Livre enregistré!" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.modifyBook = async (req, res) => {
  try {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename.split(".")[0]}optimized.webp`,
        }
      : { ...req.body };
    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    if (book.userId.toString() !== req.auth.userId) {
      return res.status(403).json({ message: "403: unauthorized request" });
    }

    if (req.file) await deleteImage(book.imageUrl);

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id },
    );
    res.status(200).json({ message: "Livre modifié!" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    if (book.userId.toString() !== req.auth.userId) {
      return res.status(403).json({ message: "403: unauthorized request" });
    }

    await deleteImage(book.imageUrl);
    await Book.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Livre supprimé!" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getBestBook = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.rateBook = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    const existingRatingIndex = book.ratings.findIndex(
      (r) => r.userId === userId,
    );

    if (existingRatingIndex !== -1) {
      book.ratings[existingRatingIndex].grade = req.body.rating;
    } else {
      book.ratings.push({
        userId,
        grade: req.body.rating,
      });
    }

    book.averageRating = calcAverageRating(book.ratings);

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error });
  }
};
