const express = require('express');
const router = express.Router();
const communeController = require('../controllers/communeController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), communeController.getCommunes);
router.get('/view', protect, communeController.getCommunes);
router.post('/', protect, protectRoute('create'), communeController.createCommune);
router.get('/:id', protect, protectRoute('view'), communeController.getCommune);
router.put('/:id', protect, protectRoute('update'), communeController.updateCommune);
router.delete('/:id', protect, protectRoute('delete'), communeController.deleteCommune);

module.exports = router;
