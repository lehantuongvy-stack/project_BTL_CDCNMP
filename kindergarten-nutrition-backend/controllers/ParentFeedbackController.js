const BaseController = require('./BaseController');

class ParentFeedbackController extends BaseController {
  constructor(db) {
    super();
    this.db = db;
  }

  // Tạo ý kiến mới
  async createFeedback(req, res) {
    try {
      const { noi_dung, tieu_de, danh_gia_sao, child_id } = req.body;
      const parent_id = req.user.id;

      if (!noi_dung || noi_dung.trim() === '') {
        return this.sendResponse(res, 400, {
          success: false,
          message: 'Nội dung ý kiến là bắt buộc'
        });
      }

      const result = await this.db.createYKienPhuHuynh({
        parent_id,
        child_id,
        noi_dung,
        tieu_de,
        danh_gia_sao
      });

      this.sendResponse(res, 201, {
        success: true,
        message: 'Gửi ý kiến thành công',
        data: result
      });
    } catch (error) {
      console.error('Create feedback error:', error);
      this.sendResponse(res, 500, {
        success: false,
        message: 'Lỗi server khi gửi ý kiến',
        error: error.message
      });
    }
  }

  // Lấy tất cả ý kiến 
  async getAllFeedback(req, res) {
    try {
      const result = await this.db.getYKienPhuHuynh();
      this.sendResponse(res, 200, {
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all feedback error:', error);
      this.sendResponse(res, 500, {
        success: false,
        message: 'Lỗi server khi lấy ý kiến',
        error: error.message
      });
    }
  }

  // Lấy ý kiến của 1 phụ huynh
  async getMyFeedback(req, res) {
    try {
      const parent_id = req.user.id;
      const result = await this.db.getYKienPhuHuynh({ parent_id });

      this.sendResponse(res, 200, {
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get parent feedback error:', error);
      this.sendResponse(res, 500, {
        success: false,
        message: 'Lỗi server khi lấy ý kiến của phụ huynh',
        error: error.message
      });
    }
  }
}

module.exports = ParentFeedbackController;
