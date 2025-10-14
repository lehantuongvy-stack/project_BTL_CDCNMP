/**
 * NutritionRp Routes
 * Định nghĩa các routes cho nutrition reports
 */

const url = require('url');
const querystring = require('querystring');

class NutritionRpRoutes {
    constructor(db, authController) {
        this.db = db;
        this.authController = authController;
        this.NutritionReportController = require("../controllers/NutritionrpController");
        this.controller = new this.NutritionReportController(db);
    }

    // Xử lý các nutrition report routes
    async handleNutritionRpRoutes(req, res, path, method) {
        try {
            // Apply authentication middleware (QUAN TRỌNG: Kiểm tra quyền truy cập)
            const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
            if (!isAuthenticated) {
                console.log('Authentication failed for nutrition reports');
                return;
            }
            
            // Kiểm tra quyền: Chỉ admin và teacher mới xem được báo cáo
            if (!['admin', 'teacher'].includes(req.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ admin và giáo viên mới có quyền xem báo cáo'
                });
            }
            
            console.log(' User authenticated:', req.user.role);
            
            // Parse request body cho POST/PUT requests
            if (['POST', 'PUT'].includes(method)) {
                req.body = await this.parseRequestBody(req);
            }

            // Route mapping
            switch (true) {
                case path === '' && method === 'GET':
                case path === '/' && method === 'GET':
                    await this.controller.getAllReports(req, res);
                    break;

                case path === '' && method === 'POST':
                case path === '/' && method === 'POST':
                    await this.controller.createReport(req, res);
                    break;

                case path === '/search' && method === 'GET':
                    await this.controller.searchReports(req, res);
                    break;

                case path.match(/^\/[^\/]+$/) && method === 'GET':
                    const getId = path.substring(1);
                    req.params = { id: getId };
                    await this.controller.getReportById(req, res);
                    break;

                case path.match(/^\/[^\/]+$/) && method === 'PUT':
                    const updateId = path.substring(1);
                    req.params = { id: updateId };
                    await this.controller.updateReport(req, res);
                    break;

                case path.match(/^\/[^\/]+$/) && method === 'DELETE':
                    const deleteId = path.substring(1);
                    req.params = { id: deleteId };
                    await this.controller.deleteReport(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Nutrition report API route not found',
                        attempted_route: `${method} /api/nutritionrp${path}`
                    });
                    break;
            }
        } catch (error) {
            console.error('NutritionRp Routes Error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Internal server error in nutrition reports',
                error: error.message
            });
        }
    }

    // Helper methods
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(JSON.stringify(data));
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
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    console.error('Body parsing error:', error);
                    resolve({});
                }
            });
            req.on('error', reject);
        });
    }

    // Apply authentication middleware
    async applyAuthMiddleware(req, res, authController) {
        try {
            const authHeader = req.headers['authorization'];
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Không có token xác thực. Vui lòng đăng nhập.'
                });
                return false;
            }

            const token = authHeader.substring(7);
            
            // Verify token using authController
            const decoded = await authController.verifyToken(token);
            
            if (!decoded) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Token không hợp lệ hoặc đã hết hạn'
                });
                return false;
            }

            // Attach user info to request
            req.user = decoded;
            return true;
            
        } catch (error) {
            console.error('Auth middleware error:', error);
            this.sendResponse(res, 401, {
                success: false,
                message: 'Xác thực thất bại',
                error: error.message
            });
            return false;
        }
    }
}

module.exports = NutritionRpRoutes;
