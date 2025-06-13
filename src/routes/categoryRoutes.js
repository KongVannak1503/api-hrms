const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
// router.get('/check/:name', categoryController.checkName);

router.get('/', protect, protectRoute('view'), categoryController.getCategories);
router.post('/', protect, protectRoute('create'), categoryController.createCategory);
router.get('/:id', protect, protectRoute('view'), categoryController.getCategory);
router.put('/:id', protect, protectRoute('update'), categoryController.updateCategory);
router.delete('/:id', protect, protectRoute('delete'), categoryController.deleteCategory);

module.exports = router;
