const express = require("express");
const router = express.Router();
const bookCtrl = require("../controllers/book");
const auth = require("../middleware/auth");
const multer = require("../middleware/multerCloudinary");

router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestBook);
router.get("/:id", bookCtrl.getOneBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.post("/", auth, multer.upload, bookCtrl.createBook);
router.put("/:id", auth, multer.upload, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
