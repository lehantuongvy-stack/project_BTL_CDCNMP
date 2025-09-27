/**
 * Ingredient Routes
 * Định nghĩa các routes cho ingredient management (nguyên liệu)
 */

const url = require('url');
const querystring = require('querystring');

class IngredientRoutes {
    constructor(ingredientController, authController) {
        this.ingredientController = ingredientController;
        this.authController = authController;
    }

    // Xử lý các ingredient routes
    async handleIngredientRoutes(req, res, path, method) {
        try {
            console.log(`Ingredient Route: ${method} ${path}`);
            
            // Apply authentication middleware
            const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
            if (!isAuthenticated) return;

            // Parse request body cho POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                req.body = await this.parseRequestBody(req);
            }

            // Decode URL và trim spaces
            const cleanPath = decodeURIComponent(path).trim();
            console.log(`Clean path: "${cleanPath}"`);

            // Parse URL parameters
            const pathParts = cleanPath.split('/').filter(Boolean);
            const ingredientId = pathParts[0];

            // Route mapping
            switch (true) {
                // GET /api/ingredients - Lấy danh sách ingredients
                case (cleanPath === '' || cleanPath === '/') && method === 'GET':
                    await this.ingredientController.getIngredients(req, res);
                    break;

                // POST /api/ingredients - Tạo ingredient mới
                case (cleanPath === '' || cleanPath === '/') && method === 'POST':
                    console.log(' POST /api/ingredients route matched!');
                    // Chỉ admin, nutritionist, teacher mới được tạo ingredient
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền tạo nguyên liệu'
                        });
                        return;
                    }
                    console.log('Calling createIngredient...');
                    await this.ingredientController.createIngredient(req, res);
                    break;

                // GET /api/ingredients/categories - Lấy danh sách categories
                case cleanPath === '/categories' && method === 'GET':
                    await this.ingredientController.getCategories(req, res);
                    break;

                // GET /api/ingredients/suppliers - Lấy danh sách suppliers
                case cleanPath === '/suppliers' && method === 'GET':
                    await this.ingredientController.getSuppliers(req, res);
                    break;

                // GET /api/ingredients/low-stock - Lấy ingredients tồn kho thấp
                case cleanPath === '/low-stock' && method === 'GET':
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền xem thông tin tồn kho'
                        });
                        return;
                    }
                    await this.ingredientController.getLowStockIngredients(req, res);
                    break;

                // GET /api/ingredients/expiring - Lấy ingredients sắp hết hạn
                case cleanPath === '/expiring' && method === 'GET':
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền xem thông tin hạn sử dụng'
                        });
                        return;
                    }
                    await this.ingredientController.getExpiringIngredients(req, res);
                    break;

                // GET /api/ingredients/stats - Thống kê ingredients
                case cleanPath === '/stats' && method === 'GET':
                    if (!['admin', 'nutritionist'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền xem thống kê'
                        });
                        return;
                    }
                    await this.ingredientController.getIngredientStats(req, res);
                    break;

                // GET /api/ingredients/search - Tìm kiếm ingredients
                case cleanPath === '/search' && method === 'GET':
                    await this.ingredientController.searchIngredients(req, res);
                    break;

                // GET /api/ingredients/:id - Lấy ingredient theo ID
                case ingredientId && ingredientId.length > 0 && method === 'GET':
                    req.params = { id: ingredientId };
                    await this.ingredientController.getIngredientById(req, res);
                    break;

                // PUT /api/ingredients/:id - Cập nhật ingredient
                case ingredientId && ingredientId.length > 0 && method === 'PUT':
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền cập nhật nguyên liệu'
                        });
                        return;
                    }
                    req.params = { id: ingredientId };
                    await this.ingredientController.updateIngredient(req, res);
                    break;

                // PATCH /api/ingredients/:id/stock - Cập nhật stock
                case ingredientId && ingredientId.length > 0 && pathParts[1] === 'stock' && method === 'PATCH':
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền cập nhật tồn kho'
                        });
                        return;
                    }
                    req.params = { id: ingredientId };
                    await this.ingredientController.updateStock(req, res);
                    break;

                // DELETE /api/ingredients/:id - Xóa ingredient
                case ingredientId && ingredientId.length > 0 && method === 'DELETE':
                    if (!['admin', 'nutritionist'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền xóa nguyên liệu'
                        });
                        return;
                    }
                    req.params = { id: ingredientId };
                    await this.ingredientController.deleteIngredient(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Ingredient route not found',
                        available_routes: [
                            'GET /api/ingredients - Lấy danh sách nguyên liệu',
                            'POST /api/ingredients - Tạo nguyên liệu mới',
                            'GET /api/ingredients/categories - Danh sách loại nguyên liệu',
                            'GET /api/ingredients/suppliers - Danh sách nhà cung cấp',
                            'GET /api/ingredients/low-stock - Nguyên liệu tồn kho thấp',
                            'GET /api/ingredients/expiring - Nguyên liệu sắp hết hạn',
                            'GET /api/ingredients/stats - Thống kê nguyên liệu',
                            'GET /api/ingredients/search?q=keyword - Tìm kiếm nguyên liệu',
                            'GET /api/ingredients/:id - Lấy nguyên liệu theo ID',
                            'PUT /api/ingredients/:id - Cập nhật nguyên liệu',
                            'PATCH /api/ingredients/:id/stock - Cập nhật tồn kho',
                            'DELETE /api/ingredients/:id - Xóa nguyên liệu'
                        ]
                    });
                    break;
            }

        } catch (error) {
            console.error('Ingredient routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong ingredient routes',
                error: error.message
            });
        }
    }

    // Parse request body
    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const contentType = req.headers['content-type'] || '';
                    if (contentType.includes('application/json')) {
                        resolve(JSON.parse(body));
                    } else if (contentType.includes('application/x-www-form-urlencoded')) {
                        resolve(querystring.parse(body));
                    } else {
                        resolve({});
                    }
                } catch (error) {
                    reject(error);
                }
            });
            req.on('error', reject);
        });
    }

    // Send response helper
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    // Apply authentication middleware
    async applyAuthMiddleware(req, res, authController) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Access token is required'
                });
                return false;
            }

            const token = authHeader.substring(7);
            const user = await authController.verifyToken(token);

            if (!user) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Invalid or expired token'
                });
                return false;
            }

            req.user = user;
            return true;
        } catch (error) {
            console.error('Authentication error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Authentication error',
                error: error.message
            });
            return false;
        }
    }
}

module.exports = IngredientRoutes;
