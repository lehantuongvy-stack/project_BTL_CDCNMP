const { v4: uuidv4 } = require('uuid');

class WarehouseController {
  constructor(db) {
    this.db = db;
  }

  // Tạo mới bản ghi kho
  async createWarehouseRecord(req, res) {
    console.log('🏪 Creating warehouse record with data:', req.body);
    
    const {
      loaiNguyenLieu,
      nguyenLieuConTon,
      tinhTrang,
      sucChua,
      ngayNhap,
      ngayRa,
      tongSoLuong
    } = req.body;

    if (!loaiNguyenLieu || !nguyenLieuConTon) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Thiếu dữ liệu bắt buộc: loaiNguyenLieu và nguyenLieuConTon' }));
      return;
    }

    try {
      // Insert warehouse record trực tiếp với trường nguyen_lieu mới (VARCHAR)
      const result = await this.insertWarehouseRecord(req.body);
      
      // Response success
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true, 
        message: 'Lưu thông tin kho hàng thành công!', 
        id: result.insertId 
      }));

    } catch (error) {
      console.error(' Error in createWarehouseRecord:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false, 
        message: 'Lỗi server: ' + error.message 
      }));
    }
  }

  // Helper method để insert warehouse record
  async insertWarehouseRecord(formData) {
    const {
      loaiNguyenLieu,    // Tên nguyên liệu text
      nguyenLieuConTon,  
      tinhTrang,
      sucChua,
      ngayRa,
      tongSoLuong
    } = formData;

    try {
      // Insert warehouse record với trường nguyen_lieu mới (VARCHAR)
      const query = `
        INSERT INTO kho_hang (nguyen_lieu, nguyen_lieu_ton, tinh_trang, suc_chua_toi_da, ngay_xuat, tong_so_luong)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      console.log('🔧 Executing warehouse insert query:', query);
      
      // Convert values according to new schema
      const nguyenLieuText = loaiNguyenLieu || 'N/A';  // VARCHAR field - store ingredient name
      const nguyenLieuTonValue = nguyenLieuConTon || 'N/A';  // Store ingredient description
      const sucChuaToiDa = parseFloat(sucChua) || 0;
      const tongSoLuongNum = parseFloat(tongSoLuong) || 0;
      
      console.log('🔧 With params:', [nguyenLieuText, nguyenLieuTonValue, tinhTrang || 'good', sucChuaToiDa, ngayRa, tongSoLuongNum]);

      const result = await this.db.query(query, [nguyenLieuText, nguyenLieuTonValue, tinhTrang || 'good', sucChuaToiDa, ngayRa, tongSoLuongNum]);
      
      console.log(' Warehouse record created successfully:', result);
      return result;
    } catch (error) {
      console.error(' Lỗi khi lưu dữ liệu kho hàng:', error);
      throw error; // Re-throw để createWarehouseRecord xử lý
    }
  }

  // Lấy toàn bộ kho
  async getAllWarehouseRecords(req, res) {
    try {
      const results = await this.db.query(`
        SELECT * FROM kho_hang 
        ORDER BY id DESC
      `);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, data: results }));
    } catch (error) {
      console.error(' Error getting warehouse records:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Lỗi khi lấy dữ liệu: ' + error.message }));
    }
  }

  async deleteWarehouseRecord(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting warehouse record with ID: ${id}`);

      if (!id) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'ID nguyên liệu là bắt buộc' }));
        return;
      }

      // Xóa record từ database
      const result = await this.db.query('DELETE FROM kho_hang WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Không tìm thấy nguyên liệu để xóa' }));
        return;
      }

      console.log(` Deleted warehouse record with ID: ${id}`);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Xóa nguyên liệu thành công',
        deletedId: id 
      }));

    } catch (error) {
      console.error(' Error deleting warehouse record:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Lỗi khi xóa nguyên liệu: ' + error.message }));
    }
  }
}

module.exports = WarehouseController;
