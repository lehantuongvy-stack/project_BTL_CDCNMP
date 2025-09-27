/**
 * Dish Routes - Định tuyến cho món ăn
 */

const DishControllerClass = require('../controllers/dishController');
const AuthController = require('../controllers/authController');
const DatabaseManager = require('../database/DatabaseManager');

class DishRoutes {
    constructor(authController = null) {
        if (authController) {
            this.authController = authController;
            // Sử dụng database connection từ authController
            this.dishController = new DishControllerClass(authController.db);
        } else {
            // Khởi tạo AuthController với DatabaseManager nếu không được truyền
            const db = new DatabaseManager();
            this.authController = new AuthController(db);
            this.dishController = new DishControllerClass(db);
        }
    }

    async handleDishRoutes(req, res, path, method) {
        try {
            console.log(`Dish Route: ${method} ${path}`);
            console.log('DishController type:', typeof this.dishController);
            console.log('getAllDishes exists:', !!this.dishController.getAllDishes);
            console.log('DishController methods:', Object.getOwnPropertyNames(this.dishController));

            // Initialize req.query if not exists
            if (!req.query) {
                req.query = {};
            }

            // Parse query parameters from URL
            if (req.url && req.url.includes('?')) {
                const urlParts = req.url.split('?');
                if (urlParts[1]) {
                    const params = new URLSearchParams(urlParts[1]);
                    for (const [key, value] of params) {
                        req.query[key] = value;
                    }
                }
            }

            // Authentication check
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, {
                    success: false,
                    message: 'Token không hợp lệ hoặc đã hết hạn'
                });
            }

            req.user = authResult.user;

            // Parse body for POST/PUT requests
            if (['POST', 'PUT'].includes(method)) {
                req.body = await this.parseBody(req);
            }

            // Route handling
            switch (path) {
                case '':
                    if (method === 'GET') {
                        return await this.dishController.getAllDishes(req, res);
                    } else if (method === 'POST') {
                        return await this.dishController.createDish(req, res);
                    }
                    break;

                case '/stats/nutrition':
                    if (method === 'GET') {
                        return await this.dishController.getNutritionStats(req, res);
                    }
                    break;

                default:
                    // Handle dynamic routes
                    const segments = path.split('/').filter(s => s);
                    
                    if (segments.length === 1) {
                        // /api/dishes/:id
                        const dishId = segments[0];
                        if (method === 'GET') {
                            req.params = { id: dishId };
                            return await this.dishController.getDishById(req, res);
                        } else if (method === 'PUT') {
                            req.params = { id: dishId };
                            return await this.dishController.updateDish(req, res);
                        } else if (method === 'DELETE') {
                            req.params = { id: dishId };
                            return await this.dishController.deleteDish(req, res);
                        }
                    } else if (segments.length === 2) {
                        const [firstSegment, secondSegment] = segments;
                        
                        if (firstSegment === 'search') {
                            // /api/dishes/search/:keyword
                            req.params = { keyword: secondSegment };
                            return await this.dishController.searchDishes(req, res);
                        } else if (secondSegment === 'ingredients') {
                            // /api/dishes/:id/ingredients
                            req.params = { id: firstSegment };
                            if (method === 'POST') {
                                return await this.dishController.addIngredientToDish(req, res);
                            }
                        }
                    }
                    break;
            }

            // Route not found
            this.sendResponse(res, 404, {
                success: false,
                message: 'Endpoint không tìm thấy',
                path: path,
                method: method
            });

        } catch (error) {
            console.error('Error in dish routes:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }

    async parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });
        });
    }

    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(JSON.stringify(data));
    }
}

module.exports = DishRoutes;
