const express = require('express');
const router = express.Router();
const kpiTemplateController = require('../controllers/kpiTemplateController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');
const protectByRoute = require('../middleware/protectByRouteMiddleware');

// Month
router.get('/month', protect, kpiTemplateController.getAllKpiTemplatesMonth);
router.post('/month', protect, kpiTemplateController.createKpiTemplateMonth);
router.post('/month/duplicate/:id', protect, kpiTemplateController.duplicateKpiTemplateMonth);
router.get('/month/:id', protect, kpiTemplateController.getKpiTemplateMonthById);
router.put('/month/:id', protect, kpiTemplateController.updateKpiTemplateMonth);
router.delete('/month/:id', protect, kpiTemplateController.deleteKpiTemplateMonth);
// End Months

// Day
router.get('/day', protect, kpiTemplateController.getAllKpiTemplatesDay);
router.post('/day', protect, kpiTemplateController.createKpiTemplateDay);
router.post('/day/duplicate/:id', protect, kpiTemplateController.duplicateKpiTemplateDay);
router.get('/day/:id', protect, kpiTemplateController.getKpiTemplateDayById);
router.put('/day/:id', protect, kpiTemplateController.updateKpiTemplateDay);
router.delete('/day/:id', protect, kpiTemplateController.deleteKpiTemplateDay);
// End Days

router.get('/', protect, kpiTemplateController.getAllKpiTemplates);
router.get('/active', protect, kpiTemplateController.getActiveKpiTemplates);
router.post('/', protect, kpiTemplateController.createKpiTemplate);
router.post('/duplicate/:id', protect, kpiTemplateController.duplicateKpiTemplate);
router.get('/:id', protect, kpiTemplateController.getKpiTemplateById);
router.put('/:id', protect, kpiTemplateController.updateKpiTemplate);
router.delete('/:id', protect, kpiTemplateController.deleteKpiTemplate);


// Individual 
// Months
router.post('/individual/month', protect, kpiTemplateController.createIndividualMonth);
router.put('/individual/month/:id', protect, kpiTemplateController.updateIndividualMonth);
router.get('/individual/month/:employee/form/:templateId', protect, kpiTemplateController.getIndividualThisMonth);
// end Months

// Days
router.post('/individual/day', protect, kpiTemplateController.createIndividualDay);
router.put('/individual/day/:id', protect, kpiTemplateController.updateIndividualDay);
router.get('/individual/:employee/day/:dayId/form/:templateId', protect, kpiTemplateController.getIndividualThisDay);
// end Days

router.post('/individual', protect, kpiTemplateController.createIndividual);
router.put('/individual/:id', protect, kpiTemplateController.updateIndividual);
router.get('/individual/:id', protect, kpiTemplateController.getEmployeeKpiSubmissionIndividualThisMonth);
router.get('/individual/year/:employee/form/:templateId', protect, kpiTemplateController.getEmployeeKpiSubmissionIndividualThisYear);

router.post('/individual/year/emp', protect, kpiTemplateController.createIndividualYearEmp);
router.put('/individual/year/emp/:id', protect, kpiTemplateController.updateIndividualYearEmp);
router.get('/individual/year/emp/:employee/form/:templateId', protect, kpiTemplateController.getIndividualThisYearEmp);

module.exports = router;
