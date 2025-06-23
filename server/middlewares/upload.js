// server/middlewares/upload.js
const multer = require("multer");
const path = require("path");

// Set storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Export upload middleware
const upload = multer({ storage });
module.exports = upload;
