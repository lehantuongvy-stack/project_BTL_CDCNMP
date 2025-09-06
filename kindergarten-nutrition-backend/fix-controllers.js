/**
 * Script thay thế res.status thành this.sendResponse trong tất cả controllers
 */

const fs = require('fs');
const path = require('path');

// Danh sách controllers cần sửa
const controllers = [
    'UserController.js',
    'ChildController.js', 
    'MealController.js',
    'IngredientController.js',
    'NutritionController.js'
];

const controllersDir = './controllers';

controllers.forEach(filename => {
    const filePath = path.join(controllersDir, filename);
    
    if (fs.existsSync(filePath)) {
        console.log(`🔧 Fixing ${filename}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Thay thế res.status().json() thành this.sendResponse()
        content = content.replace(/res\.status\((\d+)\)\.json\(/g, 'this.sendResponse(res, $1, ');
        
        // Thêm extends BaseController nếu chưa có
        if (!content.includes('extends BaseController')) {
            content = content.replace(
                /const (.+) = require\('\.\.\/models\/(.+)'\);/,
                `const BaseController = require('./BaseController');\nconst $1 = require('../models/$2');`
            );
            
            content = content.replace(
                /class (\w+Controller) \{/,
                'class $1 extends BaseController {'
            );
            
            content = content.replace(
                /constructor\(([^)]*)\) \{/,
                'constructor($1) {\n        super();'
            );
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed ${filename}`);
    } else {
        console.log(`⚠️ ${filename} not found, skipping...`);
    }
});

console.log('🎉 All controllers fixed!');
