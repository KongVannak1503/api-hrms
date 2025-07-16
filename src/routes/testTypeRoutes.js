const express = require('express');
const router = express.Router();
const testTypeController = require('../controllers/testTypeController');
const { protect } = require('../middleware/authMiddleware');

// CRUD routes with authentication
router.post('/', protect, testTypeController.createTestType);
router.get('/', protect, testTypeController.getAllTestTypes);
router.get('/:id', protect, testTypeController.getTestTypeById);
router.put('/:id', protect, testTypeController.updateTestType);
router.delete('/:id', protect, testTypeController.deleteTestType);  

module.exports = router;
