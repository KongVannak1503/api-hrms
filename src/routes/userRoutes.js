const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');


// router.post('/logout', userController.logout);
router.get('/', protect, protectRoute('view'), userController.getUsers);
router.get('/:id', protect, protectRoute('view'), userController.getUser);
router.put('/:id', protect, protectRoute('update'), userController.updateUser);
router.post('/', protect, protectRoute('update'), userController.register);
router.delete('/:id', protect, protectRoute('delete'), userController.deleteUser);

router.post(
    '/upload',
    protect,
    protectRoute('update'),
    (req, res, next) => dynamicUploader(fieldName = 'file', folder = 'users')(req, res, next), // use 'file'
    userController.uploadSingleFile
);
module.exports = router;
