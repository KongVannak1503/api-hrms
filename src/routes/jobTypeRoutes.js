const express = require('express');
const router = express.Router();
const jobTypeController = require('../controllers/jobTypeController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), jobTypeController.getJobTypes);
router.post('/', protect, protectRoute('create'), jobTypeController.createJobType);
router.get('/:id', protect, protectRoute('view'), jobTypeController.getJobType);
router.put('/:id', protect, protectRoute('update'), jobTypeController.updateJobType);
router.delete('/:id', protect, protectRoute('delete'), jobTypeController.deleteJobType);

module.exports = router;
