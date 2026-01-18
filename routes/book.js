// Package express
const express = require("express");
// Création router
const router = express.Router();
// Import du fichier sauce depuis le dossier controllers
const bookCtrl = require("../controllers/book");
// Import du fichier auth depuis le dossier middleware pour d'authentifier
const auth = require("../middleware/auth");
// Import du fichier multer-config depuis le dossier middleware pour définir destination et le non de fichiers images
const multer = require("../middleware/multer-config");
const optimizedImg = require('../middleware/sharp-config');

// les Routes
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.post('/', auth, multer, optimizedImg, bookCtrl.createBook);
router.put('/:id', auth, multer, optimizedImg, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;