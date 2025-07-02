const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');
const upload = require('../models/upload');
const multer = require('multer');
const { getMulterUploader } = require('../middleware/uploadMulti');
// const uploadMul = require('../middleware/uploadMulti');
// const uploadMul = require('../middleware/uploadMulti');
const uploadMul = multer();
const uploadDocuments = getMulterUploader('documents');

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

// General Education

router.get('/education/:id', protect, protectRoute('view'), employeeController.getEducation);

router.post(
    '/education/:id',
    protect,
    uploadMul.none(),
    employeeController.createOrUpdateEducation
);

// History

router.get('/history/:id', protect, protectRoute('view'), employeeController.getEmployeeHistory);

router.post(
    '/history/:id',
    protect,
    uploadMul.none(),
    employeeController.createOrUpdateEmployeeHistory
);
router.post(
    '/upload/:employeeId',
    protect,
    uploadMul.array('documents'),
    employeeController.uploadDocuments
);
// router.get('/upload/:employeeId', protect, employeeController.getEmployeeDocuments);
router.post(
    '/upload/:employeeId',
    protect,
    uploadDocuments.array('documents'),
    employeeController.uploadDocuments
);


module.exports = router;
