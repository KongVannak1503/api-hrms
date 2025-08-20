const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, dashboardController.getDashboardStats);
router.get('/department-chart', protect, dashboardController.getEmployeesByDepartment);

module.exports = router;
