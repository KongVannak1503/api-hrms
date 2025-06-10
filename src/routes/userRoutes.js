const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const protectRoute = require('../middleware/protectRouteMiddleware');


// router.post('/logout', userController.logout);
router.get('/', protect, protectRoute('view'), userController.getUsers);

module.exports = router;
