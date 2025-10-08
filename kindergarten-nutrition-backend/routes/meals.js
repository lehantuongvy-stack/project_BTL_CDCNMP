/**
 * Meals Routes - API endpoints cho quản lý bữa ăn và thực đơn
 * Merged version with custom handler
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
            console.log(` Meals Route: ${method} ${path}`);
            console.log(` PathParts: ${path.split('/').filter(Boolean)}`);
            
            const pathParts = path.split('/').filter(Boolean);
            
            // Test endpoint không cần auth - bypass tất cả
            if (pathParts[0] === 'test' && method === 'GET') {
                console.log(' Test endpoint - no auth required');
                this.sendResponse(res, 200, {
                    success: true,
                    message: 'Test endpoint working',
                    controller: !!this.mealController,
                    methods: Object.getOwnPropertyNames(Object.getPrototypeOf(this.mealController))
                });
                return;
            }
            
            // Apply authentication middleware
            const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
            if (!isAuthenticated) return;

            // Parse request body cho POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                req.body = await this.parseRequestBody(req);
            }

            // Route mapping
            switch (true) {
                // GET /api/meals - Lấy danh sách meals
                case (path === '' || path === '/') && method === 'GET':
                    console.log(' Matched root /api/meals route');
                    await this.mealController.getMeals(req, res);
                    break;

                // POST /api/meals - Tạo meal mới
                case (path === '' || path === '/') && method === 'POST':
                    console.log(' POST /api/meals route matched!');
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền tạo thực đơn'
                        });
                        return;
                    }
                    await this.mealController.createMeal(req, res);
                    break;

                // GET /api/meals/weekly - Lấy thực đơn theo tuần (format API chuẩn)
                case pathParts[0] === 'weekly' && method === 'GET':
                    console.log(' Matched /api/meals/weekly route');
                    await this.mealController.getWeeklyMealsForAPI(req, res);
                    break;

                // GET /api/meals/week - Lấy thực đôn theo tuần (alias)
                case pathParts[0] === 'week' && method === 'GET':
                    console.log(' Matched /api/meals/week route');
                    await this.mealController.getWeeklyMealsForAPI(req, res);
                    break;

                // GET /api/meals/date - Lấy thực đơn theo ngày (format API chuẩn) - bypass auth cho test
                case pathParts[0] === 'date' && method === 'GET':
                    console.log(' Matched /api/meals/date route - bypass auth for test');
                    req.body = await this.parseRequestBody(req);
                    await this.mealController.getMealsByDateForAPI(req, res);
                    return; // bypass auth for test

                // GET /api/meals/slide-right-home - Lấy thực đơn cho slide-right-home (không cần auth)
                case pathParts[0] === 'slide-right-home' && method === 'GET':
                    console.log(' Matched /api/meals/slide-right-home route - bypass auth');
                    req.body = await this.parseRequestBody(req);
                    await this.mealController.getSlideRightHomeMeals(req, res);
                    return; // bypass auth

                // GET /api/meals/foods - Lấy danh sách món ăn cho dropdown
                case pathParts[0] === 'foods' && method === 'GET':
                    console.log(' Matched /api/meals/foods route');
                    console.log(' Controller exists:', !!this.mealController);
                    console.log(' Method exists:', typeof this.mealController.getFoodsForDropdown);
                    await this.mealController.getFoodsForDropdown(req, res);
                    break;

                // GET /api/meals/mon-an - Lấy danh sách món ăn cho dropdown (alias)
                case pathParts[0] === 'mon-an' && method === 'GET':
                    console.log(' Matched /api/meals/mon-an route');
                    await this.mealController.getFoodsForDropdown(req, res);
                    break;

                // PUT /api/meals/update - Cập nhật thực đơn 
                case pathParts[0] === 'update' && method === 'PUT':
                    console.log(' Matched /api/meals/update route');
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền cập nhật thực đơn'
                        });
                        return;
                    }
                    await this.mealController.updateMealPlanNew(req, res);
                    break;

                // GET /api/meals/by-date/{date} - Lấy thực đơn theo ngày
                case pathParts[0] === 'by-date' && pathParts[1] && method === 'GET':
                    console.log(' Matched /api/meals/by-date route');
                    await this.mealController.getWeeklyMealsForAPI(req, res);
                    break;

                // GET /api/meals/{id}/details - Lấy chi tiết bữa ăn
                case pathParts[1] === 'details' && pathParts[0] && method === 'GET':
                    console.log(' Matched /api/meals/{id}/details route');
                    await this.mealController.getMealDetails(req, res);
                    break;

                // PUT /api/meals/{id} - Cập nhật thực đơn theo ID
                case pathParts[0] && !pathParts[1] && method === 'PUT' && pathParts[0] !== 'update':
                    console.log(' Matched /api/meals/{id} PUT route');
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền cập nhật thực đơn'
                        });
                        return;
                    }
                    await this.mealController.updateMealPlan(req, res);
                    break;

                // DELETE /api/meals/{id} - Xóa meal
                case pathParts[0] && !pathParts[1] && method === 'DELETE':
                    console.log(' Matched /api/meals/{id} DELETE route');
                    if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Không có quyền xóa thực đơn'
                        });
                        return;
                    }
                    
                    // Thêm menuId vào req.pathParams để controller access được
                    console.log(' PathParts[0]:', pathParts[0]);
                    req.pathParams = { id: pathParts[0] };
                    console.log(' req.pathParams:', req.pathParams);
                    await this.mealController.deleteMeal(req, res);
                    break;

                default:
                    console.log(' No route matched for:', method, path);
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Endpoint không tồn tại',
                        availableEndpoints: [
                            'GET /api/meals - Danh sách thực đơn',
                            'POST /api/meals - Tạo thực đơn mới',
                            'GET /api/meals/weekly?date=YYYY-MM-DD - Thực đơn theo tuần',
                            'GET /api/meals/foods - Danh sách món ăn',
                            'PUT /api/meals/update - Cập nhật thực đơn',
                            'GET /api/meals/test - Test endpoint'
                        ]
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
                message: 'Token không được cung cấp hoặc không đúng định dạng'
            });
            return false;
        }

        const token = authHeader.substring(7);
        console.log(' Verifying token...');
        
        try {
            const decoded = await authController.verifyToken(token);
            console.log(' Token decoded successfully:', decoded);
            
            // Lấy thông tin user từ database
            const user = await authController.userModel.findById(decoded.id);
            if (!user) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'User không tồn tại'
                });
                return false;
            }
            
            console.log(' User found:', { id: user.id, username: user.username, role: user.role });
            req.user = user;
            return true;
            
        } catch (error) {
            console.error(' Token verification error:', error.message);
            this.sendResponse(res, 401, {
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
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
                    const contentType = req.headers['content-type'] || '';
                    if (contentType.includes('application/json')) {
                        resolve(body ? JSON.parse(body) : {});
                    } else if (contentType.includes('application/x-www-form-urlencoded')) {
                        resolve(querystring.parse(body));
                    } else {
                        resolve(body ? JSON.parse(body) : {});
                    }
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
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
        });
        res.end(JSON.stringify(data));
    }
}

module.exports = MealsRoutes;