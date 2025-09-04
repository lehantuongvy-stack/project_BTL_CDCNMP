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
                ngay_ghi_nhan,
                chieu_cao,
                can_nang,
                bmi,
                tinh_trang_dinh_duong, // 'binh_thuong', 'suy_dinh_duong', 'thua_can', 'beo_phi'
                luong_an_sang,
                luong_an_trua,
                luong_an_chieu,
                luong_an_phu,
                calories_nap_vao,
                protein_nap_vao,
                vitamin_c,
                calcium,
                iron,
                di_ung_thuc_pham,
                benh_ly_lien_quan,
                ghi_chu,
                bac_si_kham,
                created_by
            } = recordData;

            // Tính BMI nếu chưa có
            const calculatedBMI = bmi || this.calculateBMI(can_nang, chieu_cao);
            
            // Đánh giá tình trạng dinh dưỡng nếu chưa có
            const nutritionStatus = tinh_trang_dinh_duong || this.assessNutritionStatus(calculatedBMI, recordData.age);

            const query = `
                INSERT INTO ho_so_dinh_duong (
                    child_id, ngay_ghi_nhan, chieu_cao, can_nang, bmi,
                    tinh_trang_dinh_duong, luong_an_sang, luong_an_trua,
                    luong_an_chieu, luong_an_phu, calories_nap_vao,
                    protein_nap_vao, vitamin_c, calcium, iron,
                    di_ung_thuc_pham, benh_ly_lien_quan, ghi_chu,
                    bac_si_kham, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const values = [
                child_id, ngay_ghi_nhan, chieu_cao, can_nang, calculatedBMI,
                nutritionStatus, luong_an_sang || 100, luong_an_trua || 100,
                luong_an_chieu || 100, luong_an_phu || 100, calories_nap_vao || 0,
                protein_nap_vao || 0, vitamin_c || 0, calcium || 0, iron || 0,
                di_ung_thuc_pham || '', benh_ly_lien_quan || '', ghi_chu || '',
                bac_si_kham || '', created_by
            ];

            const result = await this.db.query(query, values);
            return { id: result.insertId, bmi: calculatedBMI, tinh_trang_dinh_duong: nutritionStatus, ...recordData };

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
                    hsdd.*,
                    c.ho_ten as child_name,
                    c.ngay_sinh,
                    u.ten_dang_nhap as created_by_name
                FROM ho_so_dinh_duong hsdd
                LEFT JOIN children c ON hsdd.child_id = c.id
                LEFT JOIN users u ON hsdd.created_by = u.id
                WHERE hsdd.child_id = ?
                ORDER BY hsdd.ngay_ghi_nhan DESC
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
                    hsdd.*,
                    c.ho_ten as child_name,
                    c.ngay_sinh,
                    TIMESTAMPDIFF(MONTH, c.ngay_sinh, CURDATE()) as age_months
                FROM ho_so_dinh_duong hsdd
                LEFT JOIN children c ON hsdd.child_id = c.id
                WHERE hsdd.child_id = ?
                ORDER BY hsdd.ngay_ghi_nhan DESC
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
                FROM ho_so_dinh_duong
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
            const query = `UPDATE ho_so_dinh_duong SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
            
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
                    hsdd.*,
                    c.ho_ten as child_name,
                    c.ngay_sinh
                FROM ho_so_dinh_duong hsdd
                LEFT JOIN children c ON hsdd.child_id = c.id
                WHERE hsdd.id = ?
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
            await this.db.query('DELETE FROM ho_so_dinh_duong WHERE id = ?', [id]);
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
                    hsdd.tinh_trang_dinh_duong,
                    COUNT(*) as count,
                    AVG(hsdd.bmi) as avg_bmi,
                    AVG(hsdd.can_nang) as avg_weight,
                    AVG(hsdd.chieu_cao) as avg_height
                FROM ho_so_dinh_duong hsdd
                JOIN children c ON hsdd.child_id = c.id
                WHERE c.lop_hoc_id = ?
                AND hsdd.ngay_ghi_nhan = (
                    SELECT MAX(ngay_ghi_nhan) 
                    FROM ho_so_dinh_duong hsdd2 
                    WHERE hsdd2.child_id = hsdd.child_id
                )
                GROUP BY hsdd.tinh_trang_dinh_duong
                ORDER BY hsdd.tinh_trang_dinh_duong
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
                    hsdd.bmi,
                    hsdd.ngay_ghi_nhan,
                    hsdd.di_ung_thuc_pham,
                    hsdd.benh_ly_lien_quan
                FROM children c
                JOIN lop_hoc lh ON c.lop_hoc_id = lh.id
                JOIN ho_so_dinh_duong hsdd ON c.id = hsdd.child_id
                WHERE hsdd.ngay_ghi_nhan = (
                    SELECT MAX(ngay_ghi_nhan) 
                    FROM ho_so_dinh_duong hsdd2 
                    WHERE hsdd2.child_id = c.id
                )
                AND (
                    hsdd.tinh_trang_dinh_duong IN ('suy_dinh_duong', 'suy_dinh_duong_nang', 'beo_phi')
                    OR hsdd.di_ung_thuc_pham != ''
                    OR hsdd.benh_ly_lien_quan != ''
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
}

module.exports = NutritionRecord;
