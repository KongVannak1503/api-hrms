const express = require('express');
const router = express.Router();
const villageController = require('../controllers/villageController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), villageController.getVillages);
router.get('/view', protect, villageController.getVillages);
router.post('/', protect, protectRoute('create'), villageController.createVillage);
router.get('/:id', protect, protectRoute('view'), villageController.getVillage);
router.put('/:id', protect, protectRoute('update'), villageController.updateVillage);
router.delete('/:id', protect, protectRoute('delete'), villageController.deleteVillage);

module.exports = router;
