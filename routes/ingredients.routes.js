const router = require('express').Router();
const c = require('../controllers/ingredients.controller');

router.get('/', c.listIngredients);
router.post('/', c.createIngredient);
router.put('/:id/stock', c.updateStock);

module.exports = router;
