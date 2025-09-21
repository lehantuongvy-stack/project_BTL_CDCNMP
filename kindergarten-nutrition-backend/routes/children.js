/**
 * Children Routes
 * Định nghĩa các routes cho children management
 */

const url = require('url');
const querystring = require('querystring');

class ChildrenRoutes {
    constructor(childController, authController) {
        this.childController = childController;
        this.authController = authController;
    }

    // Xử lý các children routes
    async handleChildrenRoutes(req, res, path, method) {
        try {
            console.log('📝 ChildrenRoutes handling:', method, path);
            
            // Apply authentication middleware
            const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
            if (!isAuthenticated) {
                console.log('❌ Authentication failed');
                return;
            }
            console.log('✅ Authentication passed');

            // Parse request body cho POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                req.body = await this.parseRequestBody(req);
                console.log('📝 Parsed body:', req.body);
            }

            // Parse URL parameters
            const pathParts = path.split('/').filter(Boolean);
            const childId = pathParts[0];

            console.log('🔧 Route matching - path:', path, 'method:', method);

            // Route mapping
            switch (true) {
                // GET /api/children - Lấy danh sách children
                case (path === '' || path === '/') && method === 'GET':
                    console.log('📝 Calling getChildren');
                    await this.childController.getChildren(req, res);
                    break;

                // GET /api/children/list - Lấy danh sách children (alias)
                case path === '/list' && method === 'GET':
                    console.log('📝 Calling getChildren via /list');
                    await this.childController.getChildren(req, res);
                    break;

                // POST /api/children - Tạo child mới
                case (path === '' || path === '/') && method === 'POST':
                    console.log('📝 Calling createChild');
                    await this.childController.createChild(req, res);
                    break;

                // GET /api/children/allergies - Lấy children có dị ứng
                case path === '/allergies' && method === 'GET':
                    await this.childController.getChildrenWithAllergies(req, res);
                    break;

                // GET /api/children/stats - Thống kê children theo class
                case path === '/stats' && method === 'GET':
                    await this.childController.getChildrenStatsByClass(req, res);
                    break;

                // GET /api/children/birthdays - Sinh nhật trong tháng
                case path === '/birthdays' && method === 'GET':
                    await this.childController.getBirthdaysInMonth(req, res);
                    break;

                // GET /api/children/search - Tìm kiếm children
                case path === '/search' && method === 'GET':
                    console.log('🔍 Children search route matched');
                    // Apply authentication middleware
                    const authSearch = await this.applyAuthMiddleware(req, res, this.authController);
                    if (!authSearch) return;
                    await this.childController.searchChildrenHandler(req, res);
                    break;

                // GET /api/children/:id - Lấy child theo ID
                case childId && this.isValidUUID(childId) && method === 'GET':
                    console.log('📝 Calling getChildById with ID:', childId);
                    req.params = { id: childId };
                    await this.childController.getChildById(req, res);
                    break;

                // PUT /api/children/:id - Cập nhật child
                case childId && this.isValidUUID(childId) && method === 'PUT':
                    req.params = { id: childId };
                    await this.childController.updateChild(req, res);
                    break;

                // DELETE /api/children/:id - Xóa child
                case childId && this.isValidUUID(childId) && method === 'DELETE':
                    console.log('📝 Calling deleteChild with ID:', childId);
                    req.params = { id: childId };
                    await this.childController.deleteChild(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Children route not found',
                        available_routes: [
                            'GET /api/children - Lấy danh sách children',
                            'POST /api/children - Tạo child mới',
                            'GET /api/children/allergies - Children có dị ứng',
                            'GET /api/children/stats - Thống kê theo class',
                            'GET /api/children/birthdays?month=1 - Sinh nhật trong tháng',
                            'GET /api/children/search?q=keyword - Tìm kiếm children',
                            'GET /api/children/:id - Lấy child theo ID',
                            'PUT /api/children/:id - Cập nhật child',
                            'DELETE /api/children/:id - Xóa child'
                        ]
                    });
                    break;
            }

        } catch (error) {
            console.error('Children routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong children routes',
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

module.exports = ChildrenRoutes;