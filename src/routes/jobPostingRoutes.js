const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

// === Job Posting Routes ===
router.get('/', protect, protectRoute('view'), jobPostingController.getAllJobPostings);
router.post('/', protect, protectRoute('create'), jobPostingController.createJobPosting);
router.get('/:id', protect, protectRoute('view'), jobPostingController.getJobPostingById);
router.put('/:id', protect, protectRoute('update'), jobPostingController.updateJobPosting);
router.delete('/:id', protect, protectRoute('delete'), jobPostingController.deleteJobPosting);

// ✅ NEW: Update job posting status only (e.g., Draft → Open)
router.patch('/:id/status', protect, protectRoute('update'), jobPostingController.updateJobPostingStatus);

module.exports = router;
