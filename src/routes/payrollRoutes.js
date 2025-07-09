const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.get('/', protect, protectRoute('view'), payrollController.getPayrolls);
router.post('/', protect, payrollController.createPayroll);
router.get('/:id', protect, protectRoute('view'), payrollController.getPayroll);
router.put('/:id', protect, protectRoute('update'), payrollController.updatePayroll);
router.delete('/:id', protect, protectRoute('delete'), payrollController.deletePayroll);

module.exports = router;
