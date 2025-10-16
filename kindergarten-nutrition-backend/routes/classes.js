/**
 * Class Routes
 * Định nghĩa các routes cho classes
 */

class ClassRoutes {
    constructor(classController) {
        this.classController = classController;
    }

    // Xử lý các class routes
    async handleClassRoutes(req, res, path, method) {
        try {
            console.log(` ClassRoutes: ${method} ${path}`);

            // Route mapping
            switch (true) {
                case path === '' || path === '/' && method === 'GET':
                    await this.classController.getAllClasses(req, res);
                    break;

                case path.match(/^\/[^\/]+$/) && method === 'GET':
                    // Extract ID from path like "/12345"
                    const id = path.substring(1);
                    req.params = { id };
                    await this.classController.getClassById(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Class route not found'
                    });
                    break;
            }

        } catch (error) {
            console.error('Class routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong class routes',
                error: error.message
            });
        }
    }

    // Utility method để gửi response
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
}

module.exports = ClassRoutes;