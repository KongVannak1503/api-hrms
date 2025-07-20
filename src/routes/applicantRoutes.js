const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const applicantController = require('../controllers/applicantController');
const { protect } = require('../middleware/authMiddleware');

// Inline multer setup for this route only
const applicantStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/applicants');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const applicantFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images or PDFs are allowed'));
  }
};

const applicantUpload = multer({
  storage: applicantStorage,
  fileFilter: applicantFileFilter,
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]);

// Routes
router.get('/', protect, applicantController.getAllApplicants);
router.get('/shortlisted', protect, applicantController.getShortlistedApplicants);
router.get('/:id', protect, applicantController.getApplicantById);
router.post('/', protect, applicantUpload, applicantController.createApplicant);
router.put('/:id', protect, applicantUpload, applicantController.updateApplicant);
router.delete('/:id', protect, applicantController.deleteApplicant);

module.exports = router;
