const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const { dynamicUploader } = require('../middleware/upload');


router.get('/', protect, protectRoute('view'), organizationController.getOrganizations);
router.get('/:id', protect, protectRoute('view'), organizationController.getOrganization);
router.put('/:id', protect, protectRoute('update'), organizationController.updateOrganization);
router.delete('/:id', protect, protectRoute('delete'), organizationController.deleteOrganization);
router.post(
    '/',
    protect,
    protectRoute('create'),
    dynamicUploader('organization'),
    organizationController.createOrganization
);

module.exports = router;
