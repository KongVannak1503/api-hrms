const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set upload directory
const uploadDir = path.join(__dirname, '../uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Optional file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        cb(null, true);
    } else {
        cb(new Error('Only images or PDFs are allowed'));
    }
};

const upload = multer({ storage, fileFilter });

module.exports = {
    uploadSingle: upload.single('file'),
    uploadMultiple: upload.array('files', 10),
};
