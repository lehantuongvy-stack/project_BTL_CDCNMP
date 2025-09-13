const router = require('express').Router();
const c = require('../controllers/reports.controller');

router.get('/low-stock', c.lowStock);
router.get('/inventory', c.inventorySnapshot);
router.get('/receipts', c.receiptSummary);
router.get('/usage', c.usageSummary);

module.exports = router;
