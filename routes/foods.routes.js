const router = require('express').Router();
const c = require('../controllers/foods.controller');

router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

// công thức (recipe)
router.get('/:id/recipe', c.getRecipe);
router.post('/:id/recipe', c.setRecipe);

module.exports = router;
