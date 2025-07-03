const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), jobPostingController.getAllJobPostings);
router.post('/', protect, protectRoute('create'), jobPostingController.createJobPosting);
router.get('/:id', protect, protectRoute('view'), jobPostingController.getJobPostingById);
router.put('/:id', protect, protectRoute('update'), jobPostingController.updateJobPosting);
router.delete('/:id', protect, protectRoute('delete'), jobPostingController.deleteJobPosting);

module.exports = router;
