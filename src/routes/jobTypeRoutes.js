const express = require('express');
const router = express.Router();
const jobTypeController = require('../controllers/jobTypeController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

router.get('/', protect, protectByRoute('/api/settings', 'view'), jobTypeController.getJobTypes);
router.post('/', protect, protectByRoute('/api/settings', 'create'), jobTypeController.createJobType);
router.get('/:id', protect, protectByRoute('/api/settings', 'view'), jobTypeController.getJobType);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), jobTypeController.updateJobType);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), jobTypeController.deleteJobType);

module.exports = router;
