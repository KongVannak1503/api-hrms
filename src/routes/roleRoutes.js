const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
router.get('/check/:name', roleController.checkName);

router.post('/', protect, protectByRoute('/api/settings', 'create'), roleController.createRole);
router.get('/', protect, roleController.getRoles);
router.get('/:id', protect, roleController.getRoleById);
router.put('/:id', protect, roleController.updateRole);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), roleController.deleteRole);

module.exports = router;
