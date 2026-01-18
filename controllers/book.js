const Book = require("../models/Book");
const { cloudinary } = require("../middleware/multerCloudinary");

const calcAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((total, r) => total + r.grade, 0);
  return Number((sum / ratings.length).toFixed(2));
};

exports.createBook = async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);

    const book = new Book({
      ...bookData,
      userId: req.auth.userId,
      ratings: bookData.ratings || [],
      averageRating: calcAverageRating(bookData.ratings),
      imageUrl: req.file ? req.file.path : "",
      imageId: req.file ? req.file.filename : "",
    });

    await book.save();
    res.status(201).json({ message: "Livre enregistré !", book });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.modifyBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    if (book.userId !== req.auth.userId)
      return res.status(403).json({ message: "Non autorisé" });

    const bookData = req.file ? JSON.parse(req.body.book) : req.body;

    if (req.file) {
      if (book.imageId) {
        await cloudinary.uploader.destroy(book.imageId);
      }

      bookData.imageUrl = req.file.path;
      bookData.imageId = req.file.filename;
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, bookData, {
      new: true,
    });

    res.status(200).json({ message: "Livre modifié !", book: updatedBook });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    if (book.userId !== req.auth.userId)
      return res.status(403).json({ message: "Non autorisé" });

    if (book.imageId) {
      await cloudinary.uploader.destroy(book.imageId);
    }

    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Livre et image supprimés !" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
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

exports.getBestBook = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.rateBook = async (req, res) => {
  try {
    if (req.body.userId !== req.auth.userId)
      return res.status(401).json({ message: "Non autorisé" });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    const existingRating = book.ratings.find(
      (r) => r.userId === req.auth.userId,
    );
    if (existingRating) {
      existingRating.grade = req.body.rating;
    } else {
      book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
    }

    book.averageRating = calcAverageRating(book.ratings);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error });
  }
};
