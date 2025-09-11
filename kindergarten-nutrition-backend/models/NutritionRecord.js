/**
 * NutritionRecord Model - Quản lý hồ sơ dinh dưỡng của trẻ em
 */

const DatabaseManager = require('../database/DatabaseManager');

class NutritionRecord {
    constructor(db = null) {
        this.db = db || new DatabaseManager();
    }

    /**
     * Tạo hồ sơ dinh dưỡng mới
     */
    async create(recordData) {
        try {
            const {
                child_id,
                ngay_danh_gia,  // Thay đổi từ ngay_ghi_nhan
                chieu_cao,
                can_nang,
                bmi,
                tinh_trang_suc_khoe,  // Thay đổi từ tinh_trang_dinh_duong
                ket_luan,
                khuyen_cao,
                an_uong,
                hoat_dong,
                tinh_than,
                ghi_chu,
                teacher_id  // Thay đổi từ created_by
            } = recordData;

            // Tính BMI nếu chưa có
            const calculatedBMI = bmi || this.calculateBMI(can_nang, chieu_cao);
            
            // Đánh giá tình trạng sức khỏe nếu chưa có
            const healthStatus = tinh_trang_suc_khoe || this.assessNutritionStatus(calculatedBMI, recordData.age);

            const query = `
                INSERT INTO danh_gia_suc_khoe (
                    child_id, teacher_id, ngay_danh_gia, chieu_cao, can_nang,
                    tinh_trang_suc_khoe, ket_luan, khuyen_cao,
                    an_uong, hoat_dong, tinh_than, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const values = [
                child_id, teacher_id, ngay_danh_gia || new Date().toISOString().split('T')[0], 
                chieu_cao, can_nang, healthStatus, 
                ket_luan || ghi_chu || '', khuyen_cao || '',
                an_uong || 'good', hoat_dong || 'normal', tinh_than || 'normal'
            ];

            const result = await this.db.query(query, values);
            return { 
                id: result.insertId, 
                bmi: calculatedBMI, 
                tinh_trang_suc_khoe: healthStatus, 
                ...recordData 
            };

        } catch (error) {
            console.error('Error creating nutrition record:', error);
            throw new Error('Lỗi khi tạo hồ sơ dinh dưỡng: ' + error.message);
        }
    }

    /**
     * Tính BMI
     */
    calculateBMI(weight, height) {
        if (!weight || !height) return 0;
        // BMI = weight(kg) / (height(m))^2
        const heightInMeters = height / 100;
        return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    /**
     * Đánh giá tình trạng dinh dưỡng dựa trên BMI và tuổi
     */
    assessNutritionStatus(bmi, age) {
        // Chuẩn BMI cho trẻ em theo WHO
        if (age < 2) return 'can_danh_gia'; // Cần đánh giá riêng cho trẻ nhỏ
        
        if (bmi < 14) return 'suy_dinh_duong_nang';
        if (bmi < 16) return 'suy_dinh_duong';
        if (bmi <= 18.5) return 'binh_thuong';
        if (bmi <= 23) return 'thua_can';
        return 'beo_phi';
    }

    /**
     * Lấy hồ sơ dinh dưỡng theo child ID
     */
    async findByChildId(childId, limit = 10) {
        try {
            const query = `
                SELECT 
                    dgsk.*,
                    c.full_name as child_name,
                    c.date_of_birth,
                    u.username as created_by_name
                FROM danh_gia_suc_khoe dgsk
                LEFT JOIN children c ON dgsk.child_id = c.id
                LEFT JOIN users u ON dgsk.created_by = u.id
                WHERE dgsk.child_id = ?
                ORDER BY dgsk.ngay_ghi_nhan DESC
                LIMIT ?
            `;

            return await this.db.query(query, [childId, limit]);

        } catch (error) {
            console.error('Error finding nutrition records by child ID:', error);
            throw new Error('Lỗi khi lấy hồ sơ dinh dưỡng của trẻ');
        }
    }

    /**
     * Lấy hồ sơ dinh dưỡng mới nhất của trẻ
     */
    async getLatestRecord(childId) {
        try {
            const query = `
                SELECT 
                    dgsk.*,
                    c.full_name as child_name,
                    c.date_of_birth,
                    TIMESTAMPDIFF(MONTH, c.date_of_birth, CURDATE()) as age_months
                FROM danh_gia_suc_khoe dgsk
                LEFT JOIN children c ON dgsk.child_id = c.id
                WHERE dgsk.child_id = ?
                ORDER BY dgsk.ngay_ghi_nhan DESC
                LIMIT 1
            `;

            const records = await this.db.query(query, [childId]);
            return records.length > 0 ? records[0] : null;

        } catch (error) {
            console.error('Error getting latest nutrition record:', error);
            throw new Error('Lỗi khi lấy hồ sơ dinh dưỡng mới nhất');
        }
    }

    /**
     * Lấy biểu đồ tăng trưởng của trẻ
     */
    async getGrowthChart(childId, months = 12) {
        try {
            const query = `
                SELECT 
                    ngay_ghi_nhan,
                    chieu_cao,
                    can_nang,
                    bmi,
                    tinh_trang_dinh_duong
                FROM danh_gia_suc_khoe
                WHERE child_id = ? 
                AND ngay_ghi_nhan >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
                ORDER BY ngay_ghi_nhan ASC
            `;

            const records = await this.db.query(query, [childId, months]);

            // Tính toán xu hướng tăng trưởng
            const growth_trend = this.calculateGrowthTrend(records);

            return {
                child_id: childId,
                period_months: months,
                records,
                growth_trend
            };

        } catch (error) {
            console.error('Error getting growth chart:', error);
            throw new Error('Lỗi khi lấy biểu đồ tăng trưởng');
        }
    }

    /**
     * Tính xu hướng tăng trưởng
     */
    calculateGrowthTrend(records) {
        if (records.length < 2) return { status: 'insufficient_data' };

        const latest = records[records.length - 1];
        const previous = records[records.length - 2];

        const weight_change = latest.can_nang - previous.can_nang;
        const height_change = latest.chieu_cao - previous.chieu_cao;
        const bmi_change = latest.bmi - previous.bmi;

        return {
            weight_change: Math.round(weight_change * 10) / 10,
            height_change: Math.round(height_change * 10) / 10,
            bmi_change: Math.round(bmi_change * 10) / 10,
            trend: this.assessTrend(weight_change, height_change, bmi_change)
        };
    }

    /**
     * Đánh giá xu hướng tăng trưởng
     */
    assessTrend(weightChange, heightChange, bmiChange) {
        if (heightChange > 0 && weightChange > 0 && Math.abs(bmiChange) < 0.5) {
            return 'tang_truong_tot';
        } else if (weightChange < 0 || heightChange < 0) {
            return 'can_quan_tam';
        } else if (bmiChange > 1) {
            return 'tang_can_nhanh';
        } else if (bmiChange < -1) {
            return 'giam_can_nhanh';
        }
        return 'binh_thuong';
    }

    /**
     * Cập nhật hồ sơ dinh dưỡng
     */
    async update(id, updateData) {
        try {
            // Tính lại BMI nếu có thay đổi chiều cao hoặc cân nặng
            if (updateData.chieu_cao || updateData.can_nang) {
                const currentRecord = await this.findById(id);
                if (currentRecord) {
                    const height = updateData.chieu_cao || currentRecord.chieu_cao;
                    const weight = updateData.can_nang || currentRecord.can_nang;
                    updateData.bmi = this.calculateBMI(weight, height);
                }
            }

            const fields = [];
            const values = [];

            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('Không có dữ liệu để cập nhật');
            }

            values.push(id);
            const query = `UPDATE danh_gia_suc_khoe SET ${fields.join(', ')} WHERE id = ?`;
            
            await this.db.query(query, values);
            return await this.findById(id);

        } catch (error) {
            console.error('Error updating nutrition record:', error);
            throw new Error('Lỗi khi cập nhật hồ sơ dinh dưỡng');
        }
    }

    /**
     * Lấy hồ sơ theo ID
     */
    async findById(id) {
        try {
            const query = `
                SELECT 
                    dgsk.*,
                    c.full_name as child_name,
                    c.date_of_birth
                FROM danh_gia_suc_khoe dgsk
                LEFT JOIN children c ON dgsk.child_id = c.id
                WHERE dgsk.id = ?
            `;

            const records = await this.db.query(query, [id]);
            return records.length > 0 ? records[0] : null;

        } catch (error) {
            console.error('Error finding nutrition record by ID:', error);
            throw new Error('Lỗi khi lấy thông tin hồ sơ dinh dưỡng');
        }
    }

    /**
     * Xóa hồ sơ dinh dưỡng
     */
    async delete(id) {
        try {
            await this.db.query('DELETE FROM danh_gia_suc_khoe WHERE id = ?', [id]);
            return true;

        } catch (error) {
            console.error('Error deleting nutrition record:', error);
            throw new Error('Lỗi khi xóa hồ sơ dinh dưỡng');
        }
    }

    /**
     * Thống kê tình trạng dinh dưỡng theo lớp
     */
    async getClassNutritionStats(classId) {
        try {
            const query = `
                SELECT 
                    dgsk.tinh_trang_dinh_duong,
                    COUNT(*) as count,
                    AVG(dgsk.bmi) as avg_bmi,
                    AVG(dgsk.can_nang) as avg_weight,
                    AVG(dgsk.chieu_cao) as avg_height
                FROM danh_gia_suc_khoe dgsk
                JOIN children c ON dgsk.child_id = c.id
                WHERE c.lop_hoc_id = ?
                AND dgsk.ngay_ghi_nhan = (
                    SELECT MAX(ngay_ghi_nhan) 
                    FROM danh_gia_suc_khoe dgsk2 
                    WHERE dgsk2.child_id = dgsk.child_id
                )
                GROUP BY dgsk.tinh_trang_dinh_duong
                ORDER BY dgsk.tinh_trang_dinh_duong
            `;

            return await this.db.query(query, [classId]);

        } catch (error) {
            console.error('Error getting class nutrition stats:', error);
            throw new Error('Lỗi khi lấy thống kê dinh dưỡng lớp học');
        }
    }

    /**
     * Tìm trẻ cần quan tâm đặc biệt
     */
    async findChildrenNeedAttention() {
        try {
            const query = `
                SELECT 
                    c.id, c.ho_ten, c.ngay_sinh,
                    lh.ten_lop,
                    hsdd.tinh_trang_dinh_duong,
                    dgsk.bmi,
                    dgsk.ngay_ghi_nhan,
                    dgsk.di_ung_thuc_pham,
                    dgsk.benh_ly_lien_quan
                FROM children c
                JOIN lop_hoc lh ON c.lop_hoc_id = lh.id
                JOIN danh_gia_suc_khoe dgsk ON c.id = dgsk.child_id
                WHERE dgsk.ngay_ghi_nhan = (
                    SELECT MAX(ngay_ghi_nhan) 
                    FROM danh_gia_suc_khoe dgsk2 
                    WHERE dgsk2.child_id = c.id
                )
                AND (
                    dgsk.tinh_trang_dinh_duong IN ('suy_dinh_duong', 'suy_dinh_duong_nang', 'beo_phi')
                    OR dgsk.di_ung_thuc_pham != ''
                    OR dgsk.benh_ly_lien_quan != ''
                )
                ORDER BY 
                    CASE hsdd.tinh_trang_dinh_duong
                        WHEN 'suy_dinh_duong_nang' THEN 1
                        WHEN 'suy_dinh_duong' THEN 2
                        WHEN 'beo_phi' THEN 3
                        ELSE 4
                    END,
                    hsdd.ngay_ghi_nhan DESC
            `;

            return await this.db.query(query);

        } catch (error) {
            console.error('Error finding children need attention:', error);
            throw new Error('Lỗi khi tìm trẻ cần quan tâm đặc biệt');
        }
    }

    /**
     * Lấy tất cả hồ sơ dinh dưỡng với filters
     */
    async findAll(filters = {}) {
        try {
            let query = `
                SELECT 
                    dgsk.*,
                    c.full_name as child_name,
                    c.date_of_birth as ngay_sinh,
                    c.class_name as ten_lop,
                    u.full_name as created_by_name
                FROM danh_gia_suc_khoe dgsk
                LEFT JOIN children c ON dgsk.child_id = c.id
                LEFT JOIN users u ON dgsk.teacher_id = u.id
                WHERE 1=1
            `;
            const values = [];

            // Apply filters
            if (filters.child_id) {
                query += ' AND dgsk.child_id = ?';
                values.push(filters.child_id);
            }

            if (filters.start_date) {
                query += ' AND dgsk.ngay_danh_gia >= ?';
                values.push(filters.start_date);
            }

            if (filters.end_date) {
                query += ' AND dgsk.ngay_danh_gia <= ?';
                values.push(filters.end_date);
            }

            if (filters.nutrition_status) {
                query += ' AND dgsk.tinh_trang_suc_khoe LIKE ?';
                values.push(`%${filters.nutrition_status}%`);
            }

            query += ' ORDER BY dgsk.ngay_danh_gia DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));
                
                if (filters.offset) {
                    query += ' OFFSET ?';
                    values.push(parseInt(filters.offset));
                }
            }

            return await this.db.query(query, values);

        } catch (error) {
            console.error('Error in NutritionRecord.findAll:', error);
            throw new Error('Lỗi khi lấy danh sách hồ sơ dinh dưỡng: ' + error.message);
        }
    }
}

module.exports = NutritionRecord;
