const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
// router.get('/check/:name', categoryController.checkName);

router.get('/', protect, protectByRoute('/api/settings', 'view'), categoryController.getCategories);
router.post('/', protect, protectByRoute('/api/settings', 'create'), categoryController.createCategory);
router.get('/:id', protect, protectByRoute('/api/settings', 'view'), categoryController.getCategory);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), categoryController.updateCategory);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), categoryController.deleteCategory);

module.exports = router;
