const multer = require('multer');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'interview-attachments');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')),
});

const upload = multer({ storage });

const dynamicFieldUpload = upload.fields(
  Array.from({ length: 10 }, (_, i) => ({ name: `interviewer_${i}`, maxCount: 5 }))
);

module.exports = dynamicFieldUpload;
