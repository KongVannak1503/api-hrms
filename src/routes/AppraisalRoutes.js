const express = require('express');
const router = express.Router();
const appraisalController = require('../controllers/appraisalController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');


// Month

router.post('/individual/month', protect, appraisalController.createIndividualMonth);
router.put('/individual/month/:id', protect, appraisalController.updateIndividualMonth);
router.get('/individual/:employee/month/:dayId/form/:templateId', protect, appraisalController.getIndividualThisMonth);

router.post('/individual/month/employee', protect, appraisalController.createIndividualEmployeeMonth);
router.put('/individual/month/employee/:id', protect, appraisalController.updateIndividualEmployeeMonth);
router.get('/individual/employee/:employee/month/:dayId/form/:templateId', protect, appraisalController.getIndividualEmployeeThisMonth);

router.post('/individual/month/manager', protect, appraisalController.createIndividualManagerMonth);
router.put('/individual/month/manager/:id', protect, appraisalController.updateIndividualManagerMonth);
router.get('/individual/manager/:employee/month/:dayId/form/:templateId', protect, appraisalController.getIndividualManagerThisMonth);

router.get('/month/', protect, appraisalController.getAppraisalMonths);
router.post('/month/', protect, appraisalController.createAppraisalMonth);
router.get('/activeMonth/:employee', protect, appraisalController.getAppraisalActiveMonths);
router.get('/month/:id', protect, appraisalController.getAppraisalMonth);
router.put('/month/:id', protect, appraisalController.updateAppraisalMonth);
router.delete('/month/:id', protect, appraisalController.deleteAppraisalMonth);

// end month
router.post('/individual/day', protect, appraisalController.createIndividualDay);
router.put('/individual/day/:id', protect, appraisalController.updateIndividualDay);
router.get('/individual/:employee/day/:dayId/form/:templateId', protect, appraisalController.getIndividualThisDay);

router.post('/individual/day/employee', protect, appraisalController.createIndividualEmployeeDay);
router.put('/individual/day/employee/:id', protect, appraisalController.updateIndividualEmployeeDay);
router.get('/individual/employee/:employee/day/:dayId/form/:templateId', protect, appraisalController.getIndividualEmployeeThisDay);

router.post('/individual/day/manager', protect, appraisalController.createIndividualManagerDay);
router.put('/individual/day/manager/:id', protect, appraisalController.updateIndividualManagerDay);
router.get('/individual/manager/:employee/day/:dayId/form/:templateId', protect, appraisalController.getIndividualManagerThisDay);

router.get('/', protect, appraisalController.getAppraisalDays);
router.post('/', protect, appraisalController.createAppraisalDay);
router.get('/:id', protect, appraisalController.getAppraisalDay);
router.put('/:id', protect, appraisalController.updateAppraisalDay);
router.delete('/:id', protect, appraisalController.deleteAppraisalDay);

router.get('/view-by-department/:department', protect, appraisalController.getAppraisalDaysByDepartment);


module.exports = router;
