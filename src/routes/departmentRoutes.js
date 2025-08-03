const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

router.get('/', protect, departmentController.getDepartments);
router.get('/view', protect, departmentController.getDepartments);
router.post('/', protect, protectByRoute('/api/settings', 'create'), departmentController.createDepartment);
router.get('/:id', protect, departmentController.getDepartment);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), departmentController.updateDepartment);
router.put('/assignee/:id', protect, protectByRoute('/api/settings', 'update'), departmentController.assignManager);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), departmentController.deleteDepartment);

module.exports = router;
