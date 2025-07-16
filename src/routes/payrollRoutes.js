const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), payrollController.getPayrolls);
router.post('/', protect, payrollController.createPayroll);
router.get('/bonus', protect, protectRoute('view'), payrollController.getBonuses);
router.post('/bonus', protect, payrollController.createBonus);
router.post('/bonus/sub/:id', protect, payrollController.createSubBonus);

router.get('/bonus/:id', protect, protectRoute('view'), payrollController.getBonus);
router.get('/:id', protect, protectRoute('view'), payrollController.getPayroll);
router.put('/:id', protect, protectRoute('update'), payrollController.updatePayroll);
router.put('/bonus/:id', protect, protectRoute('update'), payrollController.updateBonus);
router.delete('/:id', protect, protectRoute('delete'), payrollController.deletePayroll);
router.delete('/bonus/:id', protect, protectRoute('delete'), payrollController.deleteBonus);

module.exports = router;
