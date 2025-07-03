const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import the dynamicUploader (but we adapt it below)
const { dynamicUploader } = require('../middleware/upload');

// --- Custom dynamic uploader for multiple fields ---
// This ensures both 'photo' and 'cv' go to /uploads/applicants
const photoCvUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/applicants');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Only images or PDFs are allowed'));
    }
  }
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]);

// Routes
router.post('/', photoCvUploader, applicantController.createApplicant);
router.get('/', applicantController.getAllApplicants);
router.get('/:id', applicantController.getApplicantById);
router.put('/:id/status', applicantController.updateApplicantStatus);
router.delete('/:id', applicantController.deleteApplicant);

module.exports = router;
