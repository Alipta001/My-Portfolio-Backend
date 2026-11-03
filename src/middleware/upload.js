const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-')}`),
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|jpg|png|webp|gif|svg\+xml|avif)$/i.test(file.mimetype)),
});

function handleImageUpload(req, res, next) {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.status = 400;
        err.message = 'Uploaded image exceeds the 5MB file size limit.';
      } else {
        err.status = 400;
      }
      return next(err);
    }
    next();
  });
}

module.exports = { imageUpload, handleImageUpload };
