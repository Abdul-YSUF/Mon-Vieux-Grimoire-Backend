const sharp = require("sharp");
const fs = require("fs").promises;

sharp.cache(false);

const optimizedImg = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const originalPath = req.file.path;
    const optimizedPath = originalPath.replace(/\.[^/.]+$/, ".webp");

    await sharp(originalPath)
      .resize({ width: 400, height: 500 })
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    await fs.unlink(originalPath);

    req.file.path = optimizedPath;
    req.file.filename = optimizedPath.split("/").pop();

    next();
  } catch (error) {
    res.status(500).json({ error: "Impossible d'optimiser l'image" });
  }
};

module.exports = optimizedImg;
