const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
// router.get('/check/:name', skillController.checkName);

router.get('/', protect, protectRoute('view'), skillController.getSkills);
router.post('/', protect, protectRoute('create'), skillController.createSkill);
router.get('/:id', protect, protectRoute('view'), skillController.getSkill);
router.put('/:id', protect, protectRoute('update'), skillController.updateSkill);
router.delete('/:id', protect, protectRoute('delete'), skillController.deleteSkill);

module.exports = router;
