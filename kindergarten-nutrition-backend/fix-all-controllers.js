const fs = require('fs');
const path = require('path');

console.log('🔧 Starting controller fixes...');

// List of controllers to fix
const controllers = [
  'UserController.js',
  'childController.js', 
  'IngredientController.js',
  'mealController.js',
  'nutritionController.js'
];

const controllersDir = path.join(__dirname, 'controllers');

// Fix each controller
controllers.forEach(controller => {
  const filePath = path.join(controllersDir, controller);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Controller not found: ${controller}`);
    return;
  }
  
  console.log(`🔄 Fixing ${controller}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add BaseController import if not present
  if (!content.includes('BaseController')) {
    content = `const BaseController = require('./BaseController');\n${content}`;
    
    // Make class extend BaseController
    content = content.replace(
      /class\s+(\w+)\s*{/,
      'class $1 extends BaseController {'
    );
  }
  
  // Replace res.status().json() with this.sendResponse()
  content = content.replace(
    /res\.status\((\d+)\)\.json\(([^)]+)\)/g,
    'this.sendResponse(res, $1, $2)'
  );
  
  // Replace res.json() with this.sendResponse(res, 200, ...)
  content = content.replace(
    /res\.json\(([^)]+)\)/g,
    'this.sendResponse(res, 200, $1)'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${controller}`);
});

console.log('🎉 All controllers fixed!');
process.exit(0);
