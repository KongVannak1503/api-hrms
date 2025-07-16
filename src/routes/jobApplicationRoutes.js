const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { protect } = require('../middleware/authMiddleware');

// ✅ Create new job application
router.post('/', protect, jobApplicationController.createJobApplication);

// ✅ Get all applications by job
router.get('/job/:job_id', protect, jobApplicationController.getApplicationsByJob);

// ✅ Update status
router.patch('/:id/status', protect, jobApplicationController.updateApplicationStatus);

// ✅ Update test score
router.patch('/:id/test-score', protect, jobApplicationController.updateTestScore);

// ✅ Update interview score
router.patch('/:id/interview-score', protect, jobApplicationController.updateInterviewScore);

// ✅ Update final score
router.patch('/:id/final-score', protect, jobApplicationController.updateFinalScore);

module.exports = router;
