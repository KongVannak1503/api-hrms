const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), districtController.getDistricts);
router.get('/view', protect, districtController.getDistricts);
router.post('/', protect, protectRoute('create'), districtController.createDistrict);
router.get('/:id', protect, protectRoute('view'), districtController.getDistrict);
router.put('/:id', protect, protectRoute('update'), districtController.updateDistrict);
router.delete('/:id', protect, protectRoute('delete'), districtController.deleteDistrict);

module.exports = router;
