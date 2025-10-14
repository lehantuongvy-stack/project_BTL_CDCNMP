/**
 * Base Controller
 * Helper methods chung cho tất cả controllers
 */

class BaseController {
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
}

module.exports = BaseController;
