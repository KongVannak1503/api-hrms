const express = require('express');
const router = express.Router();
const interviewController = require("../controllers/interviewController")

router.post('/', interviewController.scheduleInterview);
router.put('/:id/complete', interviewController.completeInterview);
router.get('/job/:jobId', interviewController.getInterviewsByJob);
router.get('/applicant/:applicantId', interviewController.getInterviewsByApplicant);
router.get('/:id', interviewController.getInterviewById);

module.exports = router;
