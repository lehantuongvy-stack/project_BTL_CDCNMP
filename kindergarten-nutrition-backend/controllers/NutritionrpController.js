const { v4: uuidv4 } = require('uuid');

class NutritionReportController {
    constructor(db) {
        this.db = db;
    }

    // Helper method for sending responses
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    // Tạo báo cáo mới
    async createReport(req, res) {
        try {
            const {
                report_name,
                school_name,
                report_date,
                num_children,
                meals_per_day,
                nutrition_data,
                growth_data,
                menu_reviews,
                created_by
            } = req.body;

            if (!school_name || !report_date) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: "Thiếu thông tin bắt buộc (school_name, report_date)"
                });
            }

            const id = uuidv4();
            const query = `
                INSERT INTO nutrition_reports
                (id, report_name, school_name, report_date, num_children, meals_per_day, nutrition_data, growth_data, menu_reviews, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await this.db.query(query, [
                id,
                report_name || 'Báo cáo dinh dưỡng',
                school_name,
                report_date,
                num_children || 0,
                meals_per_day || 0,
                JSON.stringify(nutrition_data || {}),
                JSON.stringify(growth_data || []),
                JSON.stringify(menu_reviews || []),
                created_by || null
            ]);

            this.sendResponse(res, 201, { 
                success: true, 
                message: "Tạo báo cáo thành công", 
                data: { id, school_name, report_date } 
            });
        } catch (err) {
            console.error("Create nutrition report error:", err);
            this.sendResponse(res, 500, { 
                success: false, 
                message: "Lỗi server", 
                error: err.message 
            });
        }
    }

    // Lấy tất cả báo cáo
    async getAllReports(req, res) {
        try {
            console.log('==== GETTING ALL REPORTS ====');
            
            // Query đơn giản để đếm
            console.log('Step 1: Counting records...');
            const countQuery = "SELECT COUNT(*) as total FROM nutrition_reports";
            const countResult = await this.db.query(countQuery);
            console.log('COUNT RESULT:', JSON.stringify(countResult, null, 2));
            
            // Query chính
            console.log('Step 2: Getting all records...');
            const mainQuery = "SELECT * FROM nutrition_reports ORDER BY report_date DESC";
            const rows = await this.db.query(mainQuery);
            console.log('MAIN QUERY RESULT:', JSON.stringify(rows, null, 2));
            console.log('ROWS TYPE:', typeof rows);
            console.log('IS ARRAY:', Array.isArray(rows));
            console.log('ROWS LENGTH:', rows ? rows.length : 'null/undefined');
            
            if (rows && rows.length > 0) {
                console.log('FIRST ROW SAMPLE:', JSON.stringify(rows[0], null, 2));
            }
            
            // Chuẩn bị data để trả về
            const finalData = Array.isArray(rows) ? rows : (rows ? [rows] : []);
            
            // Parse JSON strings for all reports
            const parsedData = finalData.map(report => {
                try {
                    if (report.nutrition_data && typeof report.nutrition_data === 'string') {
                        report.nutrition_data = JSON.parse(report.nutrition_data);
                    }
                    if (report.growth_data && typeof report.growth_data === 'string') {
                        report.growth_data = JSON.parse(report.growth_data);
                    }
                    if (report.menu_reviews && typeof report.menu_reviews === 'string') {
                        report.menu_reviews = JSON.parse(report.menu_reviews);
                    }
                } catch (parseError) {
                    console.error('Error parsing JSON fields for report:', report.id, parseError);
                    // Keep original values if parsing fails
                }
                return report;
            });
            
            console.log('FINAL DATA TO SEND:', parsedData.length, 'records');
            
            console.log('==== END GETTING ALL REPORTS ====');
            
            this.sendResponse(res, 200, { 
                success: true, 
                data: parsedData, 
                total: parsedData.length,
                debug: {
                    countResult,
                    rowsType: typeof rows,
                    isArray: Array.isArray(rows),
                    originalLength: rows ? rows.length : 0
                }
            });
        } catch (err) {
            console.error('getAllReports error:', err);
            this.sendResponse(res, 500, { success: false, message: "Lỗi server", error: err.message });
        }
    }

    // Lấy chi tiết báo cáo
    async getReportById(req, res) {
        try {
            const { id } = req.params;
            console.log('🔍 Getting report by ID:', id);
            
            const rows = await this.db.query("SELECT * FROM nutrition_reports WHERE id = ?", [id]);
            console.log('🔍 Query result:', rows?.length || 0, 'rows');
            console.log('🔍 Raw query result:', JSON.stringify(rows, null, 2));
            
            if (!rows || !rows.length) {
                console.log('❌ No report found for ID:', id);
                return this.sendResponse(res, 404, { success: false, message: "Không tìm thấy báo cáo" });
            }

            // Parse JSON strings back to objects
            const report = rows[0];
            console.log('📊 Raw report data:', report);
            
            try {
                if (report.nutrition_data && typeof report.nutrition_data === 'string') {
                    report.nutrition_data = JSON.parse(report.nutrition_data);
                }
                if (report.growth_data && typeof report.growth_data === 'string') {
                    report.growth_data = JSON.parse(report.growth_data);
                }
                if (report.menu_reviews && typeof report.menu_reviews === 'string') {
                    report.menu_reviews = JSON.parse(report.menu_reviews);
                }
            } catch (parseError) {
                console.error('Error parsing JSON fields:', parseError);
                // Keep original values if parsing fails
            }

            console.log('✅ Parsed report data:', report);
            this.sendResponse(res, 200, { success: true, data: report });
        } catch (err) {
            console.error('❌ getReportById error:', err);
            this.sendResponse(res, 500, { success: false, message: "Lỗi server", error: err.message });
        }
    }

    // Cập nhật báo cáo
    async updateReport(req, res) {
        try {
            const { id } = req.params;
            const { nutrition_data, growth_data, menu_reviews } = req.body;

            const query = `
                UPDATE nutrition_reports
                SET nutrition_data = ?, growth_data = ?, menu_reviews = ?, updated_at = NOW()
                WHERE id = ?
            `;
            const [result] = await this.db.query(query, [
                JSON.stringify(nutrition_data || {}),
                JSON.stringify(growth_data || []),
                JSON.stringify(menu_reviews || []),
                id
            ]);

            if (result.affectedRows === 0) {
                return this.sendResponse(res, 404, { success: false, message: "Không tìm thấy báo cáo để cập nhật" });
            }

            this.sendResponse(res, 200, { success: true, message: "Cập nhật báo cáo thành công" });
        } catch (err) {
            this.sendResponse(res, 500, { success: false, message: "Lỗi server", error: err.message });
        }
    }

    // Xóa báo cáo
    async deleteReport(req, res) {
        try {
            const { id } = req.params;
            const result = await this.db.query("DELETE FROM nutrition_reports WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                return this.sendResponse(res, 404, { success: false, message: "Không tìm thấy báo cáo để xóa" });
            }

            this.sendResponse(res, 200, { success: true, message: "Xóa báo cáo thành công" });
        } catch (err) {
            this.sendResponse(res, 500, { success: false, message: "Lỗi server", error: err.message });
        }
    }

    //Tìm kiếm báo cáo
    // Tìm kiếm báo cáo theo tên, tháng hoặc người tạo
    async searchReports(req, res) {
        try {
            const { report_name, month, created_by } = req.query;
            let query = "SELECT * FROM nutrition_reports WHERE 1=1";
            const params = [];

            if (report_name) {
                query += " AND report_name LIKE ?";
                params.push(`%${report_name}%`);
            }
            if (month) {
                // nếu month = "2025-10" thì chỉ lấy các báo cáo trong tháng đó
                query += " AND DATE_FORMAT(report_date, '%Y-%m') = ?";
                params.push(month);
            }
            if (created_by) {
                query += " AND created_by LIKE ?";
                params.push(`%${created_by}%`);
            }

            const [rows] = await this.db.query(query, params);
            res.json({ success: true, data: rows });
        } catch (err) {
            console.error("Search reports error:", err);
            res.status(500).json({ success: false, message: "Lỗi server khi tìm kiếm", error: err.message });
            }
    }

    // Test method để tạo dummy data
    async createTestReports(req, res) {
        try {
            console.log('🧪 Creating test reports...');
            const testReports = [
                {
                    id: require('uuid').v4(),
                    report_name: 'Báo cáo dinh dưỡng tháng 9',
                    school_name: 'Trường Mầm Non Hoa Hương Dương',
                    report_date: '2025-10-06',
                    num_children: 45,
                    meals_per_day: 3,
                    created_by: 'admin'
                },
                {
                    id: require('uuid').v4(),
                    report_name: 'Báo cáo dinh dưỡng tháng 9',
                    school_name: 'Trường Mầm Non Bé Thông Minh',
                    report_date: '2025-10-05',
                    num_children: 38,
                    meals_per_day: 2,
                    created_by: 'admin'
                },
                {
                    id: require('uuid').v4(),
                    report_name: 'Báo cáo dinh dưỡng tháng 9',
                    school_name: 'Trường Mầm Non Ánh Sáng',
                    report_date: '2025-10-04',
                    num_children: 52,
                    meals_per_day: 3,
                    created_by: 'admin'
                }
            ];

            for (const report of testReports) {
                const query = `
                    INSERT INTO nutrition_reports
                    (id, report_name, school_name, report_date, num_children, meals_per_day, nutrition_data, growth_data, menu_reviews, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                await this.db.query(query, [
                    report.id,
                    report.report_name,
                    report.school_name,
                    report.report_date,
                    report.num_children,
                    report.meals_per_day,
                    JSON.stringify({}),
                    JSON.stringify([]),
                    JSON.stringify(['Test review']),
                    report.created_by
                ]);
            }

            this.sendResponse(res, 200, { 
                success: true, 
                message: `Created ${testReports.length} test reports`,
                data: testReports 
            });
        } catch (err) {
            console.error('createTestReports error:', err);
            this.sendResponse(res, 500, { success: false, message: "Lỗi server", error: err.message });
        }
    }
}

module.exports = NutritionReportController;
