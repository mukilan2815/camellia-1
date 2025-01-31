// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
