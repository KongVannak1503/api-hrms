const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
// router.get('/check/:name', positionController.checkName);

router.get('/', protect, protectByRoute('/api/settings', 'view'), positionController.getPositions);
router.post('/', protect, protectByRoute('/api/settings', 'create'), positionController.createPosition);
router.get('/:id', protect, protectByRoute('/api/settings', 'view'), positionController.getPosition);
router.get('/by-department/:departmentId', protect, protectByRoute('/api/settings', 'view'), positionController.getPositionsByDepartment);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), positionController.updatePosition);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), positionController.deletePosition);

module.exports = router;
