const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Express will automatically parse JSON bodies with express.json() middleware

// Register a new user
router.post('/register', authController.register);

// Login a user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router; 