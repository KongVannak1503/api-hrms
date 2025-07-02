const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic Multer middleware factory
const getMulterUploader = (subfolder = 'default') => {
    const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);

    // Ensure upload folder exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Define storage config
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const base = path.basename(file.originalname, ext);
            const uniqueName = `${Date.now()}-${base}${ext}`;
            cb(null, uniqueName);
        }
    });

    // Only allow certain file types
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
    ];

    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    };

    return multer({ storage, fileFilter });
};

module.exports = { getMulterUploader };
