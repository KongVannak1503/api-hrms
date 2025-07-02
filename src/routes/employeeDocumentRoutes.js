const express = require('express');
const router = express.Router();
const employeeDocumentController = require('../controllers/employeeDocumentController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');
const { dynamicUploaderMulti } = require('../middleware/uploadMulti');

router.get('/', protect, protectRoute('view'), employeeDocumentController.getEmployeeDocuments);
router.get('/view', protect, employeeDocumentController.getEmployeeDocuments);
router.post('/', protect, protectRoute('create'),
    (req, res, next) => dynamicUploaderMulti('files', 'employee-document')(req, res, next),
    employeeDocumentController.createEmployeeDocument);
router.get('/:id', protect, protectRoute('view'), employeeDocumentController.getEmployeeDocument);
router.put('/:id',
    protect,
    protectRoute('update'),
    dynamicUploader('file', 'employee-document'),
    employeeDocumentController.updateEmployeeDocument);
router.delete('/:id', protect, protectRoute('delete'), employeeDocumentController.deleteEmployeeDocument);

module.exports = router;
