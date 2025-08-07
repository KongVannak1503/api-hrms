const express = require('express');
const router = express.Router();
const interviewController = require("../controllers/interviewController")
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/interviewUpload');

router.post('/', protect,  interviewController.createInterview);
router.get('/', protect, interviewController.getAllInterviews);
router.get('/:id', protect, interviewController.getInterviewById);
router.put('/:id', protect, interviewController.updateInterview);
router.put('/:id/result', protect, upload,  interviewController.updateInterviewResult);
router.put('/:id/reschedule', protect, interviewController.rescheduleInterview);
router.put('/:id/decision', protect, interviewController.updateInterviewDecision);

router.put('/:id/cancel', protect, interviewController.cancelInterview);

module.exports = router;
