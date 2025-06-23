const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
// router.get('/check/:name', departmentController.checkName);

router.get('/', protect, protectRoute('view'), departmentController.getDepartments);
router.post('/', protect, protectRoute('create'), departmentController.createDepartment);
router.get('/:id', protect, protectRoute('view'), departmentController.getDepartment);
router.put('/:id', protect, protectRoute('update'), departmentController.updateDepartment);
router.delete('/:id', protect, protectRoute('delete'), departmentController.deleteDepartment);

module.exports = router;
