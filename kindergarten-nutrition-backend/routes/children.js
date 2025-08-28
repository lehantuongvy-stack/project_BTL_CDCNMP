const express = require('express');
const router = express.Router();

// @desc    Get all children
// @route   GET /api/children
// @access  Private
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get all children endpoint - Coming soon',
    data: []
  });
});

// @desc    Get single child
// @route   GET /api/children/:id
// @access  Private
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Get child ${req.params.id} endpoint - Coming soon`,
    data: { id: req.params.id }
  });
});

// @desc    Create new child
// @route   POST /api/children
// @access  Private
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create child endpoint - Coming soon',
    data: req.body
  });
});

// @desc    Update child
// @route   PUT /api/children/:id
// @access  Private
router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Update child ${req.params.id} endpoint - Coming soon`,
    data: req.body
  });
});

// @desc    Delete child
// @route   DELETE /api/children/:id
// @access  Private
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Delete child ${req.params.id} endpoint - Coming soon`
  });
});

module.exports = router;