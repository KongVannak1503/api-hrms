const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic Multer middleware factory
const getMulterUploaderEmployeeBooks = (subfolder = 'default') => {
    const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);

    // Ensure upload folder exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

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

    // Return a middleware for multiple named fields
    const fields = [
        { name: 'healthFiles', maxCount: 10 },
        { name: 'bodyFiles', maxCount: 10 },
        { name: 'bookFiles', maxCount: 10 },
    ];

    return multer({ storage, fileFilter }).fields(fields);
};

module.exports = { getMulterUploaderEmployeeBooks };
