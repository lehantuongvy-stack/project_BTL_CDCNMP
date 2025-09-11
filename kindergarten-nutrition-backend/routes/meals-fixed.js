/**
 * Meals Routes - API endpoints cho quản lý bữa ăn và thực đơn
 */

const url = require('url');
const querystring = require('querystring');

class MealsRoutes {
    constructor(mealController, authController) {
        this.mealController = mealController;
        this.authController = authController;
    }

    // Xử lý các meal routes
    async handleMealsRoutes(req, res, path, method) {
        try {
            console.log(`🛤️  Meals Route: ${method} ${path}`);
            
            // Apply authentication middleware
            const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
            if (!isAuthenticated) return;

            // Parse request body cho POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                req.body = await this.parseRequestBody(req);
            }

            // Parse URL parameters
            const pathParts = path.split('/').filter(Boolean);
            const mealId = pathParts[0];

            // Route mapping
            switch (true) {
                // GET /api/meals - Lấy danh sách meals
                case (path === '' || path === '/') && method === 'GET':
                    await this.mealController.getMeals(req, res);
                    break;

                // POST /api/meals - Tạo meal mới
                case (path === '' || path === '/') && method === 'POST':
                    console.log('🔥 POST /api/meals route matched!');
                    // Chỉ admin, nutritionist, teacher mới được tạo meal
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền tạo thực đơn'
                        });
                        return;
                    }
                    console.log('🔥 Calling createMeal...');
                    await this.mealController.createMeal(req, res);
                    break;

                // GET /api/meals/by-date/{date} - Lấy thực đơn theo ngày
                case pathParts[0] === 'by-date' && pathParts[1] && method === 'GET':
                    await this.mealController.getMealsByDateHandler(req, res);
                    break;

                // GET /api/meals/{id} - Lấy meal theo ID
                case mealId && method === 'GET':
                    await this.mealController.getMealByIdHandler(req, res);
                    break;

                // PUT /api/meals/{id} - Cập nhật meal
                case mealId && method === 'PUT':
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền cập nhật thực đơn'
                        });
                        return;
                    }
                    await this.mealController.updateMealHandler(req, res);
                    break;

                // DELETE /api/meals/{id} - Xóa meal
                case mealId && method === 'DELETE':
                    if (!['admin', 'nutritionist'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền xóa thực đơn'
                        });
                        return;
                    }
                    await this.mealController.deleteMealHandler(req, res);
                    break;

                // GET /api/meals/by-date - Lấy danh sách meals theo ngày
                case path.startsWith('/by-date/') && method === 'GET':
                    // Apply authentication middleware
                    const authByDate = await this.applyAuthMiddleware(req, res, this.authController);
                    if (!authByDate) return;
                    await this.mealController.getMealsByDateHandler(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Endpoint không tồn tại'
                    });
            }

        } catch (error) {
            console.error('Meals route error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // Apply authentication middleware
    async applyAuthMiddleware(req, res, authController) {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            this.sendResponse(res, 401, {
                success: false,
                message: 'Token không hợp lệ - thiếu Bearer token'
            });
            return false;
        }

        const token = authHeader.substring(7);
        console.log('🔐 Verifying token with secret:', process.env.JWT_SECRET || 'kindergarten_secret_key_2024');
        
        try {
            const decoded = await authController.verifyToken(token);
            console.log('✅ Token decoded:', decoded);
            
            // Lấy thông tin user từ database
            const user = await authController.userModel.findById(decoded.id);
            if (!user) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'User không tồn tại'
                });
                return false;
            }
            
            console.log('👤 User found by ID:', user);
            req.user = user;
            return true;
            
        } catch (error) {
            console.error('❌ Token verification error:', error.message);
            this.sendResponse(res, 401, {
                success: false,
                message: 'Token không hợp lệ'
            });
            return false;
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
                    const parsedBody = body ? JSON.parse(body) : {};
                    resolve(parsedBody);
                } catch (error) {
                    console.error('Error parsing request body:', error);
                    resolve({});
                }
            });
            req.on('error', reject);
        });
    }

    // Send JSON response
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

module.exports = MealsRoutes;

// Trong case path === '' || path === '/' && method === 'GET':
endpoints: [
    'GET /api/meals - Lấy danh sách tất cả thực đơn',
    'POST /api/meals - Tạo thực đơn mới',
    'GET /api/meals/:id - Lấy thực đơn theo ID',
    'PUT /api/meals/:id - Cập nhật thực đơn',
    'DELETE /api/meals/:id - Xóa thực đơn',
    'GET /api/meals/by-date/:date - Lấy thực đơn theo ngày (YYYY-MM-DD)' // Thêm dòng này
]
