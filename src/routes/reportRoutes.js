const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

router.get('/', protect, reportController.getAllEmployeesWithManager);
router.get('/recruitment', protect, reportController.getAllApplicants);
// router.post('/', protect, protectByRoute('/api/settings', 'create'), reportController.createCity);
// router.get('/:id', protect, reportController.getCity);
// router.put('/:id', protect, protectByRoute('/api/settings', 'update'), reportController.updateCity);
// router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), reportController.deleteCity);

module.exports = router;
