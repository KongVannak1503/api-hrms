const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

router.get('/', protect, protectByRoute('/api/settings', 'view'), cityController.getCities);
router.get('/view', protect, cityController.getCities);
router.post('/', protect, protectByRoute('/api/settings', 'create'), cityController.createCity);
router.get('/:id', protect, protectByRoute('/api/settings', 'view'), cityController.getCity);
router.put('/:id', protect, protectByRoute('/api/settings', 'update'), cityController.updateCity);
router.delete('/:id', protect, protectByRoute('/api/settings', 'delete'), cityController.deleteCity);

module.exports = router;
