const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, jobApplicationController.createJobApplication);

router.get('/job/:job_id', protect, jobApplicationController.getApplicationsByJob);

router.patch('/:id/status', protect, jobApplicationController.updateApplicationStatus);

router.get('/:id', protect, jobApplicationController.getJobApplicationById);

router.put('/:id', protect, jobApplicationController.updateJobApplication);

module.exports = router;
