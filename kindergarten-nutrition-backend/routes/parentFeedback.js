class ParentFeedbackRoutes {
  constructor(feedbackController, authController) {
    this.feedbackController = feedbackController;
    this.authController = authController;
  }

  async handleFeedbackRoutes(req, res, path, method) {
    try {
      const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
      if (!isAuthenticated) return;

      if (method === 'POST' && (path === '/' || path === '')) {
        req.body = await this.parseRequestBody(req);
        await this.feedbackController.createFeedback(req, res);
      } 
      else if (method === 'GET' && path === '/all') {
        // chỉ admin được xem tất cả
        if (req.user.role !== 'admin') {
          return this.sendResponse(res, 403, {
            success: false,
            message: 'Chỉ admin mới có thể xem tất cả ý kiến'
          });
        }
        await this.feedbackController.getAllFeedback(req, res);
      }
      else if (method === 'GET' && (path === '/' || path === '')) {
        await this.feedbackController.getMyFeedback(req, res);
      }
      else {
        this.sendResponse(res, 404, {
          success: false,
          message: 'Feedback route not found'
        });
      }
    } catch (error) {
      console.error('Feedback routes error:', error);
      this.sendResponse(res, 500, {
        success: false,
        message: 'Lỗi server trong feedback routes',
        error: error.message
      });
    }
  }

  async parseRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try { resolve(JSON.parse(body || '{}')); }
        catch (error) { resolve({}); }
      });
    });
  }

  sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  async applyAuthMiddleware(req, res, authController) {
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
  }
}

module.exports = ParentFeedbackRoutes;
