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
      console.log(' Warehouse auth check - ALL headers:', JSON.stringify(req.headers, null, 2));
      console.log(' Authorization header:', req.headers.authorization);
      console.log(' Authorization header (lowercase):', req.headers['authorization']);
      
      const authResult = await authController.verifyTokenFromRequest(req);
      if (!authResult.success) {
        console.log(' Auth failed:', authResult.message);
        this.sendResponse(res, 401, authResult);
        return false;
      }
      
      console.log(' Auth successful for user:', authResult.user.username);
      req.user = authResult.user;
      return true;
    } catch (err) {
      console.log(' Auth error:', err.message);
      this.sendResponse(res, 401, { success: false, message: 'Authentication failed: ' + err.message });
      return false;
    }
  }

  sendResponse(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

module.exports = WarehouseRoutes;
