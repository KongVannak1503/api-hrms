const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), cityController.getCities);
router.get('/view', protect, cityController.getCities);
router.post('/', protect, protectRoute('create'), cityController.createCity);
router.get('/:id', protect, protectRoute('view'), cityController.getCity);
router.put('/:id', protect, protectRoute('update'), cityController.updateCity);
router.delete('/:id', protect, protectRoute('delete'), cityController.deleteCity);

module.exports = router;
