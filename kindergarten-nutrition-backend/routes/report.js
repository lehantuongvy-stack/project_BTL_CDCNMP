/**
 * Report Routes
 * Định nghĩa các routes cho báo cáo giáo viên
 */

const querystring = require('querystring');

class ReportRoutes {
    constructor(reportController, authController) {
        this.reportController = reportController;
        this.authController = authController;
    }

    async handleReportRoutes(req, res, path, method) {
        try {
            // Xác thực
            const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
            if (!isAuthenticated) return;

            // Parse body
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                req.body = await this.parseRequestBody(req);
            }

            const pathParts = path.split('/').filter(Boolean);
            const reportId = pathParts[0];

            switch (true) {
                // POST /api/reports
                case (path === '' || path === '/') && method === 'POST':
                    await this.reportController.createReport(req, res);
                    break;

                // GET /api/reports/teacher/:teacherId
                case pathParts[0] === 'teacher' && pathParts[1] && method === 'GET':
                    req.params = { teacherId: pathParts[1] };
                    await this.reportController.getReportsByTeacher(req, res);
                    break;

                // GET /api/reports/:id
                case reportId && this.isValidUUID(reportId) && method === 'GET':
                    req.params = { id: reportId };
                    await this.reportController.getReportById(req, res);
                    break;

                // PUT /api/reports/:id
                case reportId && this.isValidUUID(reportId) && method === 'PUT':
                    req.params = { id: reportId };
                    await this.reportController.updateReport(req, res);
                    break;

                // DELETE /api/reports/:id
                case reportId && this.isValidUUID(reportId) && method === 'DELETE':
                    req.params = { id: reportId };
                    await this.reportController.deleteReport(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Report route not found',
                        available_routes: [
                            'POST /api/reports',
                            'GET /api/reports/teacher/:teacherId',
                            'GET /api/reports/:id',
                            'PUT /api/reports/:id',
                            'DELETE /api/reports/:id'
                        ]
                    });
                    break;
            }
        } catch (error) {
            console.error('Report routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong report routes',
                error: error.message
            });
        }
    }

    // Parse body
    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
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

    // Send response
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    // Auth middleware
    async applyAuthMiddleware(req, res, authController) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.sendResponse(res, 401, { success: false, message: 'Access token is required' });
                return false;
            }

            const token = authHeader.substring(7);
            const user = await authController.verifyToken(token);
            if (!user) {
                this.sendResponse(res, 401, { success: false, message: 'Invalid or expired token' });
                return false;
            }

            req.user = user;
            return true;
        } catch (error) {
            console.error('Auth error:', error);
            this.sendResponse(res, 500, { success: false, message: 'Authentication error' });
            return false;
        }
    }

    // UUID check
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
}

module.exports = ReportRoutes;
