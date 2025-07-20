const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');
const protectByRoute = require('../middleware/protectByRouteMiddleware');


// router.post('/logout', userController.logout);
router.get('/', protect, protectByRoute('/api/settings', 'view'), userController.getUsers);
router.get('/:id', protect, protectByRoute('/api/settings', 'view'), userController.getUser);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), userController.updateUser);
router.post('/', protect, protectByRoute('/api/settings', 'create'), userController.register);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), userController.deleteUser);

router.post(
    '/upload',
    protect,
    protectByRoute('/api/settings', 'update'),
    (req, res, next) => dynamicUploader(fieldName = 'file', folder = 'users')(req, res, next), // use 'file'
    userController.uploadSingleFile
);
module.exports = router;
