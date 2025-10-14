// controllers/WarehouseController.js
const BaseController = require('./BaseController');
const Warehouse = require('../models/WareHouse');

class WarehouseController extends BaseController {
  constructor(db) {
    super();
    this.db = db;
    this.warehouseModel = new Warehouse(db);
  }

  // Giáo viên & admin đều có thể xem danh sách
  async getAll(req, res) {
    try {
      const records = await this.warehouseModel.getAll();
      this.sendResponse(res, 200, { success: true, data: records });
    } catch (err) {
      this.sendResponse(res, 500, { success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const record = await this.warehouseModel.getById(id);
      if (!record)
        return this.sendResponse(res, 404, { success: false, message: 'Không tìm thấy bản ghi kho hàng' });
      this.sendResponse(res, 200, { success: true, data: record });
    } catch (err) {
      this.sendResponse(res, 500, { success: false, message: err.message });
    }
  }

  // Giáo viên có thể nhập thêm, admin có thể tạo hoặc cập nhật
  async create(req, res) {
    try {
      const { role, id: userId } = req.user;
      if (!['teacher', 'admin'].includes(role))
        return this.sendResponse(res, 403, { success: false, message: 'Không có quyền thêm kho hàng' });

      const recordId = await this.warehouseModel.create(req.body, userId);
      this.sendResponse(res, 201, { success: true, message: 'Thêm kho hàng thành công', id: recordId });
    } catch (err) {
      this.sendResponse(res, 500, { success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      if (req.user.role !== 'admin')
        return this.sendResponse(res, 403, { success: false, message: 'Chỉ admin được quyền chỉnh sửa' });

      const { id } = req.params;
      await this.warehouseModel.update(id, req.body);
      this.sendResponse(res, 200, { success: true, message: 'Cập nhật kho hàng thành công' });
    } catch (err) {
      this.sendResponse(res, 500, { success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      if (req.user.role !== 'admin')
        return this.sendResponse(res, 403, { success: false, message: 'Chỉ admin được phép xóa' });

      const { id } = req.params;
      await this.warehouseModel.delete(id);
      this.sendResponse(res, 200, { success: true, message: 'Xóa kho hàng thành công' });
    } catch (err) {
      this.sendResponse(res, 500, { success: false, message: err.message });
    }
  }
}

module.exports = WarehouseController;
