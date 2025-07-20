const express = require('express');
const router = express.Router();
const testAssignmentController = require('../controllers/testAssignmentController');
const { protect } = require('../middleware/authMiddleware');
const { dynamicUploader } = require('../middleware/upload');

router.post('/', protect, testAssignmentController.createTestAssignment);
router.get('/', protect, testAssignmentController.getAllTestAssignments);

// ✅ Specific routes FIRST
router.get('/:id/detail', protect, testAssignmentController.getTestAssignmentDetail);
router.put('/:id/result',
  protect,
  dynamicUploader('attachment', 'test-assignments'),
  testAssignmentController.updateTestResult
);
router.put('/:id/schedule', protect, testAssignmentController.updateScheduleTestAssignment);
router.put('/:id/cancel', protect, testAssignmentController.cancelTestAssignment);

// ✅ Generic /:id routes LAST
router.get('/:id', protect, testAssignmentController.getTestAssignmentById);
router.put('/:id', protect, testAssignmentController.updateTestAssignment);
router.delete('/:id', protect, testAssignmentController.deleteTestAssignment);

module.exports = router;
