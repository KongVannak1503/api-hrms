const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

// Place the specific route before the param route to avoid conflicts
router.get('/check/:name', roleController.checkName);

router.post('/', protect, roleController.createRole);
router.get('/', protect, roleController.getRoles);
router.get('/:id', protect, roleController.getRoleById);
router.put('/:id', protect, protectRoute('update'), roleController.updateRole);
router.delete('/:id', protect, protectRoute('delete'), roleController.deleteRole);

module.exports = router;
