const express = require('express');
const router = express.Router();
const testAssignmentController = require('../controllers/testAssignmentController');
const { protect } = require('../middleware/authMiddleware');

// CRUD routes
router.post('/', protect, testAssignmentController.createTestAssignment);
router.get('/', protect, testAssignmentController.getAllTestAssignments);
router.get('/:id', protect, testAssignmentController.getTestAssignmentById);
router.put('/:id', protect, testAssignmentController.updateTestAssignment);
router.put('/:id/schedule', protect, testAssignmentController.updateScheduleTestAssignment);
router.delete('/:id', protect, testAssignmentController.deleteTestAssignment);

router.get('/:id/detail', protect, testAssignmentController.getTestAssignmentDetail);

module.exports = router;
