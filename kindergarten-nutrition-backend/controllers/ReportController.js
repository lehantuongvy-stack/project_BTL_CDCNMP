/**
 * Report Controller
 * Xử lý logic quản lý báo cáo giáo viên
 */

const BaseController = require('./BaseController');
const { v4: uuidv4 } = require('uuid');

class ReportController extends BaseController {
    constructor(db) {
        super();
        this.db = db;
    }

    // Tạo báo cáo mới
    async createReport(req, res) {
        try {
            const { teacher_id, class_id, report_date, attendance, health, activities, notes, summary } = req.body;

            if (!teacher_id || !class_id || !report_date) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu thông tin bắt buộc (teacher_id, class_id, report_date)'
                });
            }

            const id = uuidv4();
            const query = `
                INSERT INTO teacher_reports (id, teacher_id, class_id, report_date, attendance, health, activities, notes, summary)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await this.db.query(query, [
                id,
                teacher_id,
                class_id,
                report_date,
                JSON.stringify(attendance || []),
                JSON.stringify(health || []),
                activities || null,
                notes || null,
                JSON.stringify(summary || {})
            ]);

            this.sendResponse(res, 201, {
                success: true,
                message: 'Tạo báo cáo thành công',
                data: { id, teacher_id, class_id, report_date }
            });
        } catch (error) {
            console.error(' Create report error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi tạo báo cáo',
                error: error.message
            });
        }
    }

    // Lấy báo cáo theo teacher
    async getReportsByTeacher(req, res) {
        try {
            const { teacherId } = req.params;
            const { from, to } = req.query;

            let query = `SELECT * FROM teacher_reports WHERE teacher_id = ?`;
            const params = [teacherId];

            if (from && to) {
                query += ` AND report_date BETWEEN ? AND ?`;
                params.push(from, to);
            }

            const reports = await this.db.query(query, params);
            this.sendResponse(res, 200, { success: true, data: reports[0] || [] });
        } catch (error) {
            console.error(' Get teacher reports error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách báo cáo',
                error: error.message
            });
        }
    }

    // Lấy chi tiết báo cáo
    async getReportById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.db.query(`SELECT * FROM teacher_reports WHERE id = ?`, [id]);

            if (!result[0] || result[0].length === 0) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy báo cáo'
                });
            }

            this.sendResponse(res, 200, { success: true, data: result[0][0] });
        } catch (error) {
            console.error(' Get report by ID error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy báo cáo',
                error: error.message
            });
        }
    }

    // Cập nhật báo cáo
    async updateReport(req, res) {
        try {
            const { id } = req.params;
            const { attendance, health, activities, notes, summary } = req.body;

            const query = `
                UPDATE teacher_reports
                SET attendance = ?, health = ?, activities = ?, notes = ?, summary = ?, updated_at = NOW()
                WHERE id = ?
            `;

            const result = await this.db.query(query, [
                JSON.stringify(attendance || []),
                JSON.stringify(health || []),
                activities || null,
                notes || null,
                JSON.stringify(summary || {}),
                id
            ]);

            if (result[0].affectedRows === 0) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy báo cáo để cập nhật'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                message: 'Cập nhật báo cáo thành công'
            });
        } catch (error) {
            console.error(' Update report error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi cập nhật báo cáo',
                error: error.message
            });
        }
    }

    // Xóa báo cáo
    async deleteReport(req, res) {
        try {
            const { id } = req.params;
            const result = await this.db.query(`DELETE FROM teacher_reports WHERE id = ?`, [id]);

            if (result[0].affectedRows === 0) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy báo cáo để xóa'
                });
            }

            this.sendResponse(res, 200, { success: true, message: 'Xóa báo cáo thành công' });
        } catch (error) {
            console.error(' Delete report error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi xóa báo cáo',
                error: error.message
            });
        }
    }
}

module.exports = ReportController;
