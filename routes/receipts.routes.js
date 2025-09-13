const router = require('express').Router();
const c = require('../controllers/receipts.controller');

router.post('/', c.createReceipt);
router.get('/', c.listReceipts);
router.get('/:id', c.getReceipt);

module.exports = router;
