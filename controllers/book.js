const Book = require("../models/Book");

const calcAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((total, r) => total + r.grade, 0);
  return Number((sum / ratings.length).toFixed(2));
};

exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: req.file.path,
      averageRating: bookObject.ratings?.[0]?.grade || 0,
    });

    await book.save();
    res.status(201).json({ message: "Livre enregistré !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.modifyBook = async (req, res) => {
  try {
    const bookObject = req.file
      ? { ...JSON.parse(req.body.book), imageUrl: req.file.path }
      : { ...req.body };

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Book.updateOne({ _id: req.params.id }, bookObject);
    res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Livre supprimé !" });
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

exports.rateBook = async (req, res) => {
  try {
    if (req.body.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    const existingRating = book.ratings.find(
      (r) => r.userId === req.auth.userId,
    );

    if (existingRating) {
      existingRating.grade = req.body.rating;
    } else {
      book.ratings.push({
        userId: req.auth.userId,
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
