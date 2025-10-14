class ReportingService {
  constructor(db) {
    this.db = db;
  }

  async generateHealthReport(filters = {}) {
    const { class_name, start_date, end_date } = filters;
    const params = [];
    let whereClause = 'WHERE c.is_active = true';
    
    if (class_name) {
      whereClause += ' AND c.class_name = ?';
      params.push(class_name);
    }
    if (start_date && end_date) {
      whereClause += ' AND h.ngay_danh_gia BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    return await this.db.query(`
      SELECT c.*, h.chieu_cao, h.can_nang, h.bmi, h.tinh_trang_suc_khoe,
             t.full_name as teacher_name, p.full_name as parent_name
      FROM children c
      LEFT JOIN danh_gia_suc_khoe h ON c.id = h.child_id
      LEFT JOIN users t ON c.teacher_id = t.id  
      LEFT JOIN users p ON c.parent_id = p.id
      ${whereClause}
      ORDER BY c.class_name, c.full_name
    `, params);
  }

  async generateNutritionReport(filters = {}) {
    const { start_date, end_date, class_name } = filters;
    const params = [start_date || '2024-01-01', end_date || '2025-12-31'];
    
    if (class_name) params.push(class_name);

    return await this.db.query(`
      SELECT td.*, ma.total_calories, ma.total_protein, u.full_name as creator_name,
             AVG(yk.danh_gia_sao) as avg_rating
      FROM thuc_don td
      LEFT JOIN chi_tiet_thuc_don ct ON td.id = ct.thuc_don_id
      LEFT JOIN mon_an ma ON ct.mon_an_id = ma.id
      LEFT JOIN users u ON td.created_by = u.id
      LEFT JOIN y_kien_phu_huynh yk ON td.id = yk.thuc_don_id
      WHERE td.ngay_ap_dung BETWEEN ? AND ?
      ${class_name ? 'AND td.lop_ap_dung = ?' : ''}
      GROUP BY td.id
      ORDER BY td.ngay_ap_dung DESC
    `, params);
  }

  async exportToExcel(data, type) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo Cáo');
    
    const headers = type === 'health' 
      ? ['Mã HS', 'Họ tên', 'Lớp', 'Chiều cao', 'Cân nặng', 'BMI', 'Giáo viên']
      : ['Tên thực đơn', 'Ngày áp dụng', 'Loại bữa', 'Calories', 'Đánh giá'];
    
    worksheet.addRow(headers);
    data.forEach(row => {
      const values = type === 'health'
        ? [row.student_id, row.full_name, row.class_name, row.chieu_cao, row.can_nang, row.bmi, row.teacher_name]
        : [row.ten_thuc_don, row.ngay_ap_dung, row.loai_bua_an, row.total_calories, row.avg_rating];
      worksheet.addRow(values);
    });

    const filename = `bao-cao-${type}-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(`./public/reports/${filename}`);
    return { filename, download_url: `/reports/${filename}` };
  }
}

module.exports = ReportingService;
