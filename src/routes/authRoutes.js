const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');

router.post(
    '/register',
    authController.register
);

router.post(
    '/login',
    authController.login
);
router.get('/access/:id', authController.accessToken);

router.get('/users', protect, protectRoute('view'), (req, res) => {
    res.json({ status: 'success' });
});

// Route to update user - requires 'update' action
router.put('/users/:id', protect, protectRoute('update'), (req, res) => {
    res.json({ status: 'success', data: req.user });
});


router.get('/test', protect, protectRoute('view'), (req, res) => {
    res.json({ message: 'API is working' });
});

module.exports = router;
