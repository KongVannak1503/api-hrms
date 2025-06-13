const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
// router.get('/check/:name', positionController.checkName);

router.get('/', protect, protectRoute('view'), positionController.getPositions);
router.post('/', protect, protectRoute('create'), positionController.createPosition);
router.get('/:id', protect, protectRoute('view'), positionController.getPosition);
router.put('/:id', protect, protectRoute('update'), positionController.updatePosition);
router.delete('/:id', protect, protectRoute('delete'), positionController.deletePosition);

module.exports = router;
