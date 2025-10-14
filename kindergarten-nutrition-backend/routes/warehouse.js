// routes/warehouse.js
class WarehouseRoutes {
  constructor(warehouseController, authController) {
    this.warehouseController = warehouseController;
    this.authController = authController;
  }

  async handleWarehouseRoutes(req, res, path, method) {
    try {
      // Xác thực người dùng
      const isAuthenticated = await this.applyAuthMiddleware(req, res, this.authController);
      if (!isAuthenticated) return;

      // Phân tích URL
      const pathParts = path.split('/').filter(Boolean);
      const id = pathParts[0];

      // Routing
      switch (true) {
        case (path === '' || path === '/') && method === 'GET':
          await this.warehouseController.getAll(req, res);
          break;

        case id && method === 'GET':
          req.params = { id };
          await this.warehouseController.getById(req, res);
          break;

        case (path === '' || path === '/') && method === 'POST':
          req.body = await this.parseRequestBody(req);
          await this.warehouseController.create(req, res);
          break;

        case id && method === 'PUT':
          req.params = { id };
          req.body = await this.parseRequestBody(req);
          await this.warehouseController.update(req, res);
          break;

        case id && method === 'DELETE':
          req.params = { id };
          await this.warehouseController.delete(req, res);
          break;

        default:
          this.sendResponse(res, 404, { success: false, message: 'Warehouse route not found' });
      }
    } catch (err) {
      this.sendResponse(res, 500, { success: false, message: 'Server error', error: err.message });
    }
  }

  // Helper giống userRoutes
  async parseRequestBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve({}); }
      });
    });
  }

  async applyAuthMiddleware(req, res, authController) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.sendResponse(res, 401, { success: false, message: 'Access token required' });
        return false;
      }
      const token = authHeader.substring(7);
      const user = await authController.verifyToken(token);
      if (!user) {
        this.sendResponse(res, 401, { success: false, message: 'Invalid token' });
        return false;
      }
      req.user = user;
      return true;
    } catch (err) {
      this.sendResponse(res, 401, { success: false, message: 'Authentication failed' });
      return false;
    }
  }

  sendResponse(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

module.exports = WarehouseRoutes;
