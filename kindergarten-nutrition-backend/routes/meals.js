const express = require('express');
const router = express.Router();

// @desc    Get all meals
// @route   GET /api/meals
// @access  Private
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get all meals endpoint - Coming soon',
    data: []
  });
});

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Private
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Get meal ${req.params.id} endpoint - Coming soon`,
    data: { id: req.params.id }
  });
});

// @desc    Create new meal
// @route   POST /api/meals
// @access  Private
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create meal endpoint - Coming soon',
    data: req.body
  });
});

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Update meal ${req.params.id} endpoint - Coming soon`,
    data: req.body
  });
});

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Delete meal ${req.params.id} endpoint - Coming soon`
  });
});

module.exports = router;