const express = require('express');
const router = express.Router();
const educationLevelController = require('../controllers/educationLevelController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, educationLevelController.getEducationLevels);
router.get('/view', protect, educationLevelController.getEducationLevels);
router.post('/', protect, protectRoute('create'), educationLevelController.createEducationLevel);
router.get('/:id', protect, educationLevelController.getEducationLevel);
router.put('/:id', protect, protectRoute('update'), educationLevelController.updateEducationLevel);
router.delete('/:id', protect, protectRoute('delete'), educationLevelController.deleteEducationLevel);

module.exports = router;
