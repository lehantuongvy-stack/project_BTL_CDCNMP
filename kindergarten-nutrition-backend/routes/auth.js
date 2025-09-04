/**
 * Auth Routes
 * Định nghĩa các routes cho authentication
 */

const url = require('url');
const querystring = require('querystring');

class AuthRoutes {
    constructor(authController) {
        this.authController = authController;
    }

    // Xử lý các auth routes
    async handleAuthRoutes(req, res, path, method) {
        try {
            // Parse request body cho POST requests
            if (method === 'POST') {
                req.body = await this.parseRequestBody(req);
            }

            // Route mapping
            switch (true) {
                case path === '/login' && method === 'POST':
                    await this.authController.login(req, res);
                    break;

                case path === '/register' && method === 'POST':
                    // Apply authentication middleware
                    const authResult = await this.authController.authenticate()(req, res, () => {});
                    if (authResult === false) return; // Authentication failed
                    await this.authController.register(req, res);
                    break;

                case path === '/me' && method === 'GET':
                    // Apply authentication middleware
                    const authResultMe = await this.authController.authenticate()(req, res, () => {});
                    if (authResultMe === false) return; // Authentication failed
                    await this.authController.getCurrentUser(req, res);
                    break;

                case path === '/change-password' && method === 'POST':
                    // Apply authentication middleware
                    const authResultPassword = await this.authController.authenticate()(req, res, () => {});
                    if (authResultPassword === false) return; // Authentication failed
                    await this.authController.changePassword(req, res);
                    break;

                case path === '' || path === '/' && method === 'GET':
                    this.sendResponse(res, 200, {
                        success: true,
                        message: 'Auth API endpoints',
                        endpoints: [
                            'POST /api/auth/login - Đăng nhập',
                            'POST /api/auth/register - Đăng ký (Admin only)',
                            'GET /api/auth/me - Lấy thông tin user hiện tại',
                            'POST /api/auth/change-password - Đổi mật khẩu'
                        ]
                    });
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Auth route not found'
                    });
                    break;
            }

        } catch (error) {
            console.error('Auth routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong auth routes',
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

    // Apply authentication middleware for Pure Node.js
    async applyAuthMiddleware(req, res, controller) {
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
            const user = await controller.verifyToken(token);

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

module.exports = AuthRoutes;
