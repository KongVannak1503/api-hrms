const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');

router.get('/', protect, protectRoute('view'), employeeController.getEmployees);
router.post(
    '/',
    protect,
    protectRoute('create'),
    (req, res, next) => dynamicUploader(fieldName = 'file', folder = 'employees')(req, res, next), // use 'file'
    employeeController.createEmployee
);
router.put(
    '/:id',
    protect,
    protectRoute('update'),
    dynamicUploader('file', 'employees'),
    employeeController.updateEmployee
);

router.get('/:id', protect, protectRoute('view'), employeeController.getEmployee);
// router.put('/:id', protect, protectRoute('update'), employeeController.updateCategory);
router.delete('/:id', protect, protectRoute('delete'), employeeController.deleteEmployee);

module.exports = router;
