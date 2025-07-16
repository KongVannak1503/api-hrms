const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), departmentController.getDepartments);
router.get('/view', protect, departmentController.getDepartments);
router.post('/', protect, protectRoute('create'), departmentController.createDepartment);
router.get('/:id', protect, protectRoute('view'), departmentController.getDepartment);
router.put('/:id', protect, protectRoute('update'), departmentController.updateDepartment);
router.put('/assignee/:id', protect, protectRoute('update'), departmentController.assignManager);
router.delete('/:id', protect, protectRoute('delete'), departmentController.deleteDepartment);

module.exports = router;
