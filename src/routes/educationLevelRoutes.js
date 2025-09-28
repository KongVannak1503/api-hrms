const express = require('express');
const router = express.Router();
const educationLevelController = require('../controllers/educationLevelController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

router.get('/', protect, educationLevelController.getEducationLevels);
router.get('/view', protect, educationLevelController.getEducationLevels);
router.post('/', protect, protectByRoute('/api/settings', 'create'), educationLevelController.createEducationLevel);
router.get('/:id', protect, educationLevelController.getEducationLevel);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), educationLevelController.updateEducationLevel);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), educationLevelController.deleteEducationLevel);

module.exports = router;
