const express = require('express');
const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', (req, res) => {
  res.json({
    success: true,
    message: 'Register endpoint - Coming soon',
    data: req.body
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint - Coming soon',
    data: req.body
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', (req, res) => {
  res.json({
    success: true,
    message: 'Get current user endpoint - Coming soon'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout endpoint - Coming soon'
  });
});

module.exports = router;