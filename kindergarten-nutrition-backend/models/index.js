/**
 * Models Index
 * Export tất cả models để dễ dàng import
 */

const User = require('./User');
const Child = require('./Child');
const Ingredient = require('./Ingredient');
const Food = require('./Food');
const Meal = require('./Meal');
const NutritionRecord = require('./NutritionRecord');

module.exports = {
    User,
    Child,
    Ingredient,
    Food,
    Meal,
    NutritionRecord
};