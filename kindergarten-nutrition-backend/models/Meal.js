/**
 * Meal Model - Quản lý bữa ăn và thực đơn hàng ngày
 */

const DatabaseManager = require('../database/DatabaseManager');

class Meal {
    constructor(db = null) {
        this.db = db || new DatabaseManager();
    }

    /**
     * Tạo thực đơn mới
     */
    async create(mealData) {
        try {
            const { v4: uuidv4 } = require('uuid');
            const mealId = uuidv4();
            
            const {
                ten_thuc_don,
                ngay_ap_dung,
                loai_bua_an, // 'breakfast', 'lunch', 'dinner', 'snack'
                lop_ap_dung,
                so_tre_du_kien = 30,
                trang_thai = 'draft',
                created_by,
                ghi_chu = ''
            } = mealData;

            // Validation
            if (!ten_thuc_don || !ngay_ap_dung || !loai_bua_an) {
                throw new Error('Thiếu thông tin bắt buộc: tên thực đơn, ngày áp dụng, loại bữa ăn');
            }

            const query = `
                INSERT INTO thuc_don (
                    id, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                    lop_ap_dung, so_tre_du_kien, trang_thai,
                    created_by, ghi_chu, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const values = [
                mealId, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                lop_ap_dung, so_tre_du_kien, trang_thai,
                created_by, ghi_chu
            ];

            await this.db.query(query, values);
            return await this.findById(mealId);

        } catch (error) {
            console.error('Error creating meal:', error);
            throw new Error('Lỗi khi tạo thực đơn: ' + error.message);
        }
    }

    /**
     * Lấy tất cả thực đơn với pagination
     */
    async findAll(limit = 50, offset = 0) {
        try {
            const query = `
                SELECT 
                    td.*,
                    GROUP_CONCAT(
                        CONCAT(ma.ten_mon_an, ' (', ctd.so_khau_phan, ' khẩu phần)')
                        SEPARATOR ', '
                    ) as danh_sach_mon_an
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                GROUP BY td.id
                ORDER BY td.ngay_ap_dung DESC, td.loai_bua_an ASC
                LIMIT ? OFFSET ?
            `;

            const meals = await this.db.query(query, [limit, offset]);
            return meals || [];

        } catch (error) {
            console.error('Error finding all meals:', error);
            throw new Error('Lỗi khi lấy danh sách thực đơn: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ID
     */
    async findById(id) {
        try {
            const query = `
                SELECT 
                    td.*,
                    GROUP_CONCAT(
                        CONCAT(ma.ten_mon_an, ' (', ctd.so_khau_phan, ' khẩu phần)')
                        SEPARATOR ', '
                    ) as danh_sach_mon_an
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                WHERE td.id = ?
                GROUP BY td.id
            `;

            const meals = await this.db.query(query, [id]);
            return meals && meals.length > 0 ? meals[0] : null;

        } catch (error) {
            console.error('Error finding meal by ID:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ID: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ngày
     */
    async findByDate(date) {
        try {
            const query = `
                SELECT 
                    id, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                    lop_ap_dung, so_tre_du_kien, trang_thai,
                    created_by, ghi_chu, created_at, updated_at
                FROM thuc_don 
                WHERE DATE(ngay_ap_dung) = ?
                ORDER BY loai_bua_an, created_at
            `;
            
            const results = await this.db.query(query, [date]);
            return results;
        } catch (error) {
            console.error('Error finding meals by date:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ngày: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ngày và lớp
     */
    async findByDateAndClass(date, classId = null) {
        try {
            let query = `
                SELECT 
                    td.*,
                    ma.ten_mon, ma.mo_ta, ma.calories_per_serving,
                    ma.protein_per_serving, ma.carbs_per_serving,
                    ma.fat_per_serving, ma.image_url,
                    lh.ten_lop
                FROM thuc_don td
                LEFT JOIN mon_an ma ON td.mon_an_id = ma.id
                LEFT JOIN lop_hoc lh ON td.lop_hoc_id = lh.id
                WHERE td.ngay = ?
            `;
            const values = [date];

            if (classId) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(classId);
            }

            query += ' ORDER BY td.buoi_an, td.created_at';

            const meals = await this.db.query(query, values);
            
            // Nhóm theo buổi ăn
            const groupedMeals = this.groupMealsBySession(meals);
            
            return groupedMeals;

        } catch (error) {
            console.error('Error finding meals by date:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ngày');
        }
    }

    /**
     * Nhóm bữa ăn theo buổi
     */
    groupMealsBySession(meals) {
        const grouped = {
            sang: [],
            trua: [],
            chieu: [],
            phu: []
        };

        meals.forEach(meal => {
            if (grouped[meal.buoi_an]) {
                grouped[meal.buoi_an].push(meal);
            }
        });

        return grouped;
    }

    /**
     * Lấy thực đơn theo tuần
     */
    async findByWeek(startDate, endDate, classId = null) {
        try {
            let query = `
                SELECT 
                    td.*,
                    ma.ten_mon, ma.mo_ta, ma.calories_per_serving,
                    ma.protein_per_serving, ma.carbs_per_serving,
                    ma.fat_per_serving, ma.image_url,
                    lh.ten_lop
                FROM thuc_don td
                LEFT JOIN mon_an ma ON td.mon_an_id = ma.id
                LEFT JOIN lop_hoc lh ON td.lop_hoc_id = lh.id
                WHERE td.ngay BETWEEN ? AND ?
            `;
            const values = [startDate, endDate];

            if (classId) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(classId);
            }

            query += ' ORDER BY td.ngay, td.buoi_an';

            return await this.db.query(query, values);

        } catch (error) {
            console.error('Error finding meals by week:', error);
            throw new Error('Lỗi khi lấy thực đơn theo tuần');
        }
    }

    /**
     * Tạo thực đơn cho cả tuần
     */
    async createWeeklyMenu(weeklyMenuData) {
        try {
            const { start_date, class_id, meals, created_by } = weeklyMenuData;
            const results = [];

            // Transaction để đảm bảo tính nhất quán
            await this.db.beginTransaction();

            try {
                for (const meal of meals) {
                    const mealData = {
                        ngay: meal.date,
                        buoi_an: meal.session,
                        mon_an_id: meal.food_id,
                        lop_hoc_id: class_id,
                        so_luong_phuc_vu: meal.serving_count || 30,
                        ghi_chu: meal.notes || '',
                        chi_phi_du_kien: meal.estimated_cost || 0,
                        created_by
                    };

                    const result = await this.create(mealData);
                    results.push(result);
                }

                await this.db.commit();
                return results;

            } catch (error) {
                await this.db.rollback();
                throw error;
            }

        } catch (error) {
            console.error('Error creating weekly menu:', error);
            throw new Error('Lỗi khi tạo thực đơn tuần');
        }
    }

    /**
     * Lấy thống kê dinh dưỡng của thực đơn
     */
    async getNutritionSummary(date, classId = null) {
        try {
            let query = `
                SELECT 
                    td.buoi_an,
                    SUM(ma.calories_per_serving * td.so_luong_phuc_vu) as total_calories,
                    SUM(ma.protein_per_serving * td.so_luong_phuc_vu) as total_protein,
                    SUM(ma.carbs_per_serving * td.so_luong_phuc_vu) as total_carbs,
                    SUM(ma.fat_per_serving * td.so_luong_phuc_vu) as total_fat,
                    SUM(td.chi_phi_du_kien) as total_cost,
                    COUNT(*) as meal_count
                FROM thuc_don td
                JOIN mon_an ma ON td.mon_an_id = ma.id
                WHERE td.ngay = ?
            `;
            const values = [date];

            if (classId) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(classId);
            }

            query += ' GROUP BY td.buoi_an ORDER BY td.buoi_an';

            const sessionStats = await this.db.query(query, values);

            // Tính tổng cho cả ngày
            const dailyTotal = sessionStats.reduce((total, session) => ({
                total_calories: total.total_calories + (session.total_calories || 0),
                total_protein: total.total_protein + (session.total_protein || 0),
                total_carbs: total.total_carbs + (session.total_carbs || 0),
                total_fat: total.total_fat + (session.total_fat || 0),
                total_cost: total.total_cost + (session.total_cost || 0),
                meal_count: total.meal_count + session.meal_count
            }), {
                total_calories: 0,
                total_protein: 0,
                total_carbs: 0,
                total_fat: 0,
                total_cost: 0,
                meal_count: 0
            });

            return {
                date,
                class_id: classId,
                sessions: sessionStats,
                daily_total: dailyTotal
            };

        } catch (error) {
            console.error('Error getting nutrition summary:', error);
            throw new Error('Lỗi khi lấy tóm tắt dinh dưỡng');
        }
    }

    /**
     * Cập nhật thực đơn
     */
    async update(id, updateData) {
        try {
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
            const query = `UPDATE thuc_don SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
            
            await this.db.query(query, values);
            return await this.findById(id);

        } catch (error) {
            console.error('Error updating meal:', error);
            throw new Error('Lỗi khi cập nhật thực đơn');
        }
    }

    /**
     * Xóa thực đơn
     */
    async delete(id) {
        try {
            await this.db.query('DELETE FROM thuc_don WHERE id = ?', [id]);
            return true;

        } catch (error) {
            console.error('Error deleting meal:', error);
            throw new Error('Lỗi khi xóa thực đơn');
        }
    }

    /**
     * Lấy lịch sử thực đơn
     */
    async getHistory(filters = {}) {
        try {
            let query = `
                SELECT 
                    td.*,
                    ma.ten_mon,
                    lh.ten_lop,
                    u.ten_dang_nhap as created_by_name
                FROM thuc_don td
                LEFT JOIN mon_an ma ON td.mon_an_id = ma.id
                LEFT JOIN lop_hoc lh ON td.lop_hoc_id = lh.id
                LEFT JOIN users u ON td.created_by = u.id
                WHERE 1=1
            `;
            const values = [];

            if (filters.start_date) {
                query += ' AND td.ngay >= ?';
                values.push(filters.start_date);
            }

            if (filters.end_date) {
                query += ' AND td.ngay <= ?';
                values.push(filters.end_date);
            }

            if (filters.class_id) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(filters.class_id);
            }

            query += ' ORDER BY td.ngay DESC, td.buoi_an';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));
            }

            return await this.db.query(query, values);

        } catch (error) {
            console.error('Error getting meal history:', error);
            throw new Error('Lỗi khi lấy lịch sử thực đơn');
        }
    }
}

module.exports = Meal;
