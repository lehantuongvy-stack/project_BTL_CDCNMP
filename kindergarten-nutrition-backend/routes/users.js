/**
 * User Routes
 * Định nghĩa các routes cho user management
 */

const url = require('url');
const querystring = require('querystring');

class UserRoutes {
    constructor(userController, authController) {
        this.userController = userController;
        this.authController = authController;
    }

    // Xử lý các user routes
    async handleUserRoutes(req, res, path, method) {
        try {
            // Apply authentication middleware
            const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
            if (!isAuthenticated) return;

            // Parse request body cho POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                req.body = await this.parseRequestBody(req);
            }

            // Parse URL parameters
            const pathParts = path.split('/').filter(Boolean);
            const userId = pathParts[0];

            // Route mapping
            switch (true) {
                // GET /api/users - Lấy danh sách users
                case (path === '' || path === '/') && method === 'GET':
                    await this.userController.getUsers(req, res);
                    break;

                // POST /api/users - Tạo user mới (Admin only)
                case (path === '' || path === '/') && method === 'POST':
                    await this.userController.createUser(req, res);
                    break;

                // GET /api/users/stats - Lấy thống kê users
                case path === '/stats' && method === 'GET':
                    if (!['admin'].includes(req.user.role)) {
                        this.sendResponse(res, 403, {
                            success: false,
                            message: 'Chỉ admin mới có thể xem thống kê'
                        });
                        return;
                    }
                    await this.userController.getUserStats(req, res);
                    break;

                // GET /api/users/search - Tìm kiếm users
                case path === '/search' && method === 'GET':
                    // Apply authentication middleware
                    const authSearch = await this.applyAuthMiddleware(req, res, this.authController);
                    if (!authSearch) return;
                    await this.userController.searchUsersHandler(req, res);
                    break;

                // GET /api/users/:id - Lấy user theo ID
                case userId && this.isValidUUID(userId) && method === 'GET':
                    req.params = { id: userId };
                    await this.userController.getUserById(req, res);
                    break;

                // PUT /api/users/:id - Cập nhật user
                case userId && this.isValidUUID(userId) && method === 'PUT' && !pathParts[1]:
                    req.params = { id: userId };
                    await this.userController.updateUser(req, res);
                    break;

                // PUT /api/users/:id/password - Cập nhật mật khẩu
                case userId && this.isValidUUID(userId) && pathParts[1] === 'password' && method === 'PUT':
                    req.params = { id: userId };
                    await this.userController.updatePassword(req, res);
                    break;

                // DELETE /api/users/:id - Xóa user
                case userId && this.isValidUUID(userId) && method === 'DELETE':
                    req.params = { id: userId };
                    await this.userController.deleteUser(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'User route not found',
                        available_routes: [
                            'GET /api/users - Lấy danh sách users',
                            'POST /api/users - Tạo user mới (Admin)',
                            'GET /api/users/stats - Thống kê users (Admin)',
                            'GET /api/users/search?q=keyword - Tìm kiếm users',
                            'GET /api/users/:id - Lấy user theo ID',
                            'PUT /api/users/:id - Cập nhật user',
                            'PUT /api/users/:id/password - Cập nhật mật khẩu',
                            'DELETE /api/users/:id - Xóa user (Admin)'
                        ]
                    });
                    break;
            }

        } catch (error) {
            console.error('User routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong user routes',
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

    // Helper method to validate UUID format
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
}

module.exports = UserRoutes;
