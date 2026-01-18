const express = require("express");
const router = express.Router();

const bookCtrl = require("../controllers/book");
const auth = require("../middleware/auth");
const multer = require("../middleware/multerCloudinary");

// Routes publiques
router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestBook);
router.get("/:id", bookCtrl.getOneBook);

// Routes protégées
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.post("/", auth, multer, bookCtrl.createBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
