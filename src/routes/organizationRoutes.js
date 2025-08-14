const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');
const protectByRoute = require('../middleware/protectByRouteMiddleware');


router.get('/', protect, protectByRoute('/api/settings', 'view'), organizationController.getOrganizations);
router.get('/active', protect, protectByRoute('/api/settings', 'view'), organizationController.getOrganizations);
router.post(
    '/',
    protect,
    protectByRoute('/api/settings', 'create'),
    (req, res, next) => dynamicUploader(fieldName = 'file', folder = 'organization')(req, res, next),
    organizationController.createOrganization
);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), (req, res, next) => dynamicUploader(fieldName = 'file', folder = 'organization')(req, res, next), organizationController.updateOrganization);
router.get('/:id', protect, protectByRoute('/api/settings', 'view'), organizationController.getOrganization);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), organizationController.deleteOrganization);

module.exports = router;
