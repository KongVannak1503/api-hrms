const express = require('express');
const router = express.Router();
const appraisalController = require('../controllers/appraisalController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

router.get('/', protect, appraisalController.getAppraisalDays);
router.post('/', protect, appraisalController.createAppraisalDay);
router.get('/:id', protect, appraisalController.getAppraisalDay);
router.put('/:id', protect, appraisalController.updateAppraisalDay);
router.delete('/:id', protect, appraisalController.deleteAppraisalDay);

router.get('/view-by-department/:department', protect, appraisalController.getAppraisalDaysByDepartment);

module.exports = router;
