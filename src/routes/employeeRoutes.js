const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');
const upload = require('../models/upload');
const multer = require('multer');
const { getMulterUploader } = require('../middleware/uploadMulti');
const { getMulterUploaderEmployeeBooks } = require('../middleware/uploadEmployeeBook');
// const uploadMul = require('../middleware/uploadMulti');
// const uploadMul = require('../middleware/uploadMulti');
const uploadMul = multer();
const multerUploader = getMulterUploader('documents');

router.get('/language', protect, employeeController.getLanguages);
router.get('/language/:id', protect, employeeController.getLanguage);

router.post(
    '/language',
    protect,
    uploadMul.none(),
    employeeController.createLanguage
);
router.put(
    '/language/:id',
    protect,
    uploadMul.none(),
    employeeController.updateLanguage
);

router.post(
    '/upload/:employeeId',
    protect,
    multerUploader.array('documents'),
    employeeController.uploadDocuments
);
router.delete('/upload/:id', protect, protectRoute('delete'), employeeController.deleteDocument);
// Position
router.get('/position/:employeeId', protect, protectRoute('view'), employeeController.getEmployeePositions);

router.post(
    '/position/:employeeId',
    protect,
    multerUploader.array('documents'),
    employeeController.createEmployeePosition
);


router.put('/position/:id',
    multerUploader.array('documents'),
    employeeController.updateEmployeePosition);

// labor law

router.post(
    '/laborLaw/:employeeId',
    protect,
    multerUploader.array('documents'),
    employeeController.uploadLaborLaw
);
router.delete('/laborLaw/:id', protect, protectRoute('delete'), employeeController.deleteLaborLaw);
router.get('/laborLaw/:employeeId', protect, protectRoute('view'), employeeController.getEmployeeLaborLaw);
// NSSF

router.post(
    '/nssf/:employeeId',
    protect,
    multerUploader.fields([
        { name: 'documents', maxCount: 10 }
    ]),
    employeeController.uploadNssf
);
router.delete('/nssf/:id', protect, protectRoute('delete'), employeeController.deleteNssf);
router.get('/nssf/:employeeId', protect, protectRoute('view'), employeeController.getEmployeeNssf);
router.delete('/nssf/doc/:id', protect, protectRoute('delete'), employeeController.deleteNssfDoc);
router.get('/nssf/doc/:employeeId', protect, protectRoute('view'), employeeController.getEmployeeNssfDoc);


router.post(
    '/book/:employeeId',
    protect,
    getMulterUploaderEmployeeBooks('documents'),
    employeeController.uploadBooks
);
router.get('/book/:employeeId', protect, protectRoute('view'), employeeController.getEmployeeBooks);
router.get('/healthBook/:employeeId', protect, protectRoute('view'), employeeController.getEmployeeHealthBooks);
router.get('/bodyBook/:employeeId', protect, protectRoute('view'), employeeController.getEmployeeBodyBooks);

router.delete('/book/:id', protect, protectRoute('delete'), employeeController.deleteBook);
router.delete('/healthBook/:id', protect, protectRoute('delete'), employeeController.deleteHealthBook);
router.delete('/bodyBook/:id', protect, protectRoute('delete'), employeeController.deleteBodyBook);


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

router.put(
    '/assign/:id',
    protect,
    protectRoute('update'),
    employeeController.assignPosition
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
router.get('/upload/:employeeId', protect, employeeController.getEmployeeDocuments);
// router.post(
//     '/upload/:employeeId',
//     protect,
//     uploadDocuments.array('documents'),
//     employeeController.uploadDocuments
// );
router.get('/upload/:employeeId', protect, protectRoute('view'), employeeController.getEmployees);
// router.post(
//     '/upload123/:employeeId',
//     protect,
//     uploadDocuments.array('documents'),
//     employeeController.uploadDocuments
// );



module.exports = router;
