const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing database execute methods in models...');

// List of models to fix
const models = [
  'Child.js',
  'Food.js',
  'Ingredient.js',
  'Meal.js',
  'NutritionRecord.js'
];

const modelsDir = path.join(__dirname, 'models');

// Fix each model
models.forEach(model => {
  const filePath = path.join(modelsDir, model);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Model not found: ${model}`);
    return;
  }
  
  console.log(`🔄 Fixing ${model}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace this.db.execute with this.db.query
  content = content.replace(/this\.db\.execute/g, 'this.db.query');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${model}`);
});

console.log('🎉 All models fixed!');
process.exit(0);
