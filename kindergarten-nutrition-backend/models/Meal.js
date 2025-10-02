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

    /**
     * Lấy chi tiết bữa ăn với thông tin đầy đủ các món ăn
     */
    async getMealDetails(mealId) {
        try {
            const query = `
                SELECT 
                    td.id,
                    td.ngay_ap_dung,
                    td.loai_bua_an,
                    td.class_id as lop_ap_dung,
                    td.ten_thuc_don as ten_bua_an,
                    td.ghi_chu,
                    ma.id as mon_an_id,
                    ma.ten_mon_an,
                    ma.mo_ta,
                    ma.total_calories as kcal,
                    ma.total_protein as protein,
                    ma.total_fat as fat,
                    ma.total_carbs as carbs,
                    ma.huong_dan_che_bien,
                    ctd.so_khau_phan,
                    ctd.thu_tu_phuc_vu
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                WHERE td.id = ?
                ORDER BY ctd.thu_tu_phuc_vu ASC
            `;

            const rows = await this.db.query(query, [mealId]);
            
            if (!rows || rows.length === 0) {
                return null;
            }

            // Lấy thông tin cơ bản của bữa ăn từ row đầu tiên
            const mealInfo = {
                id: rows[0].id,
                ngay_ap_dung: rows[0].ngay_ap_dung,
                loai_bua_an: rows[0].loai_bua_an,
                lop_ap_dung: rows[0].lop_ap_dung,
                ten_bua_an: rows[0].ten_bua_an,
                ghi_chu: rows[0].ghi_chu,
                mon_an: [],
                tong_kcal: 0
            };

            // Xử lý danh sách món ăn
            let totalKcal = 0;
            rows.forEach(row => {
                if (row.mon_an_id) {
                    const monAn = {
                        id: row.mon_an_id,
                        ten_mon_an: row.ten_mon_an,
                        mo_ta: row.mo_ta,
                        kcal: row.kcal || 0,
                        protein: row.protein || 0,
                        fat: row.fat || 0,
                        carbs: row.carbs || 0,
                        huong_dan_che_bien: row.huong_dan_che_bien,
                        so_khau_phan: row.so_khau_phan,
                        thu_tu_phuc_vu: row.thu_tu_phuc_vu
                    };
                    
                    mealInfo.mon_an.push(monAn);
                    totalKcal += (row.kcal || 0) * (row.so_khau_phan || 1);
                }
            });

            mealInfo.tong_kcal = Math.round(totalKcal);

            return mealInfo;

        } catch (error) {
            console.error('Error getting meal details:', error);
            throw new Error('Lỗi khi lấy chi tiết bữa ăn: ' + error.message);
        }
    }

    /**
     * Lấy danh sách thư viện món ăn (từ DB + JSON tĩnh)
     */
    async getAllFoods() {
        try {
            const fs = require('fs');
            const path = require('path');

            // Lấy món ăn từ database
            const dbQuery = `
                SELECT 
                    id,
                    ten_mon_an,
                    mo_ta,
                    loai_mon,
                    do_tuoi_phu_hop,
                    total_calories as kcal,
                    total_protein as protein,
                    total_fat as fat,
                    total_carbs as carbs,
                    huong_dan_che_bien,
                    trang_thai
                FROM mon_an 
                WHERE trang_thai = 'active'
                ORDER BY loai_mon, ten_mon_an
            `;

            const dbFoods = await this.db.query(dbQuery) || [];

            // Đọc dữ liệu từ file JSON tĩnh
            let staticFoods = [];
            try {
                const staticFilePath = path.join(__dirname, '../data/mon_an_static.json');
                if (fs.existsSync(staticFilePath)) {
                    const staticData = JSON.parse(fs.readFileSync(staticFilePath, 'utf8'));
                    staticFoods = staticData.foods || [];
                }
            } catch (jsonError) {
                console.warn('Could not read static foods file:', jsonError.message);
            }

            // Merge dữ liệu từ DB và JSON
            const allFoods = [...staticFoods];
            
            // Thêm món ăn từ DB (chỉ thêm những món chưa có trong static data)
            dbFoods.forEach(dbFood => {
                const exists = staticFoods.find(staticFood => 
                    staticFood.id === dbFood.id || 
                    staticFood.ten_mon_an === dbFood.ten_mon_an
                );
                
                if (!exists) {
                    allFoods.push({
                        id: dbFood.id,
                        ten_mon_an: dbFood.ten_mon_an,
                        mo_ta: dbFood.mo_ta,
                        loai_mon: dbFood.loai_mon,
                        do_tuoi_phu_hop: dbFood.do_tuoi_phu_hop,
                        kcal: dbFood.kcal || 0,
                        protein: dbFood.protein || 0,
                        fat: dbFood.fat || 0,
                        carbs: dbFood.carbs || 0,
                        huong_dan_che_bien: dbFood.huong_dan_che_bien,
                        trang_thai: dbFood.trang_thai
                    });
                }
            });

            // Sắp xếp theo loại món và tên
            allFoods.sort((a, b) => {
                if (a.loai_mon !== b.loai_mon) {
                    return (a.loai_mon || '').localeCompare(b.loai_mon || '');
                }
                return (a.ten_mon_an || '').localeCompare(b.ten_mon_an || '');
            });

            return {
                foods: allFoods,
                total: allFoods.length,
                from_database: dbFoods.length,
                from_static: staticFoods.length
            };

        } catch (error) {
            console.error('Error getting all foods:', error);
            throw new Error('Lỗi khi lấy danh sách món ăn: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo tuần với format chuẩn cho API
     */
    async getWeeklyMealsForAPI(startDate, endDate, nhom = null, classId = null) {
        try {
            console.log(`🔍 getWeeklyMealsForAPI called with: startDate=${startDate}, endDate=${endDate}, nhom=${nhom}, classId=${classId}`);
            
            // Build WHERE clause với tham số đúng
            let whereClause = 'td.ngay_ap_dung BETWEEN ? AND ? AND td.trang_thai IN (?, ?)';
            let queryParams = [startDate, endDate, 'active', 'approved'];

            // Thêm filter theo nhom nếu có (database field is nhom_lop)
            if (nhom) {
                whereClause += ' AND td.nhom_lop = ?';
                queryParams.push(nhom);
                console.log(` Adding nhom filter: ${nhom}`);
            }

            // Thêm filter theo class_id nếu có
            if (classId) {
                whereClause += ' AND td.class_id = ?';
                queryParams.push(classId);
                console.log(` Adding class_id filter: ${classId}`);
            }

            const query = `
                SELECT 
                    td.id as thuc_don_id,
                    td.ngay_ap_dung,
                    td.loai_bua_an,
                    td.class_id,
                    td.nhom_lop as nhom,
                    ma.id as mon_an_id,
                    ma.ten_mon_an,
                    ma.total_calories as kcal,
                    ma.total_protein as protein,
                    ma.total_fat as fat,
                    ma.total_carbs as carbs,
                    ctd.so_khau_phan,
                    c.name as ten_lop
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                LEFT JOIN classes c ON td.class_id = c.id
                WHERE ${whereClause}
                ORDER BY td.ngay_ap_dung, td.loai_bua_an ASC
            `;

            console.log(`🔍 SQL Query:`, query);
            console.log(`🔍 Query params:`, queryParams);

            const rows = await this.db.query(query, queryParams);
            
            if (!rows || rows.length === 0) {
                // Return mock data when database is empty
                const fs = require('fs');
                const path = require('path');
                try {
                    const mockPath = path.join(__dirname, '../data/mock_weekly_meals.json');
                    if (fs.existsSync(mockPath)) {
                        const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
                        return mockData.data;
                    }
                } catch (error) {
                    console.warn('Could not load mock data:', error.message);
                }
                
                return {
                    nhom: nhom || 'all',
                    tuan: {
                        start_date: startDate,
                        end_date: endDate
                    },
                    thuc_don: []
                };
            }

            // Group data theo ngày và buổi
            const groupedData = {};

            rows.forEach(row => {
                const date = row.ngay_ap_dung;
                let buoi = 'khac'; // default

                // Map loai_bua_an to buoi
                switch (row.loai_bua_an) {
                    case 'breakfast':
                        buoi = 'sang';
                        break;
                    case 'lunch':
                        buoi = 'trua';
                        break;
                    case 'snack':
                        buoi = 'xen';
                        break;
                    default:
                        buoi = 'khac';
                }

                const key = `${date}_${buoi}`;

                if (!groupedData[key]) {
                    groupedData[key] = {
                        ngay: date,
                        buoi: buoi,
                        nhom: row.nhom, // Add nhom field from database
                        nhom_lop: row.nhom, // For backward compatibility
                        mon_an: []
                    };
                }

                // Add món ăn if exists
                if (row.mon_an_id && row.ten_mon_an) {
                    const existingFood = groupedData[key].mon_an.find(
                        food => food.id === row.mon_an_id
                    );

                    if (!existingFood) {
                        groupedData[key].mon_an.push({
                            id: row.mon_an_id,
                            ten_mon_an: row.ten_mon_an,
                            kcal: row.kcal || 0,
                            protein: row.protein || 0,
                            fat: row.fat || 0,
                            carbs: row.carbs || 0
                        });
                    }
                }
            });

            return {
                nhom: nhom || 'all',
                tuan: {
                    start_date: startDate,
                    end_date: endDate
                },
                thuc_don: Object.values(groupedData)
            };

        } catch (error) {
            console.error('Error getting weekly meals for API:', error);
            throw new Error('Lỗi khi lấy thực đơn tuần: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ngày với format chuẩn cho API
     */
    async getMealsByDateForAPI(date, nhom = null, classId = null) {
        try {
            console.log(`🔍 getMealsByDateForAPI called with: date=${date}, nhom=${nhom}, classId=${classId}`);
            
            // Build WHERE clause
            let whereClause = 'td.ngay_ap_dung = ? AND td.trang_thai IN (?, ?)';
            let queryParams = [date, 'active', 'approved'];

            // Thêm filter theo nhom nếu có (database field is nhom_lop)
            if (nhom) {
                whereClause += ' AND td.nhom_lop = ?';
                queryParams.push(nhom);
                console.log(` Adding nhom filter: ${nhom}`);
            }

            // Thêm filter theo class_id nếu có
            if (classId) {
                whereClause += ' AND td.class_id = ?';
                queryParams.push(classId);
                console.log(` Adding class_id filter: ${classId}`);
            }

            const query = `
                SELECT 
                    td.id as thuc_don_id,
                    td.ngay_ap_dung,
                    td.loai_bua_an,
                    td.class_id,
                    td.nhom_lop as nhom,
                    ma.id as mon_an_id,
                    ma.ten_mon_an,
                    ma.total_calories as kcal,
                    ma.total_protein as protein,
                    ma.total_fat as fat,
                    ma.total_carbs as carbs,
                    ctd.so_khau_phan,
                    c.name as ten_lop
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                LEFT JOIN classes c ON td.class_id = c.id
                WHERE ${whereClause}
                ORDER BY td.loai_bua_an ASC
            `;

            console.log(`🔍 SQL Query:`, query);
            console.log(`🔍 Query params:`, queryParams);

            const rows = await this.db.query(query, queryParams);
            
            if (!rows || rows.length === 0) {
                return {
                    nhom: nhom || 'all',
                    ngay: date,
                    thuc_don: []
                };
            }

            // Transform data to expected API format
            const groupedData = {};

            rows.forEach(row => {
                if (!row.mon_an_id) return; // Skip empty meals
                
                const dateStr = row.ngay_ap_dung.toISOString().split('T')[0];
                let buoi = row.loai_bua_an;

                // Map loai_bua_an to buoi
                switch (row.loai_bua_an) {
                    case 'breakfast':
                        buoi = 'sang';
                        break;
                    case 'lunch':
                        buoi = 'trua';
                        break;
                    case 'snack':
                        buoi = 'xen';
                        break;
                    default:
                        buoi = 'khac';
                }

                const key = `${dateStr}_${buoi}`;

                if (!groupedData[key]) {
                    groupedData[key] = {
                        ngay: dateStr,
                        buoi: buoi,
                        nhom: row.nhom,
                        class_id: row.class_id,
                        mon_an: []
                    };
                }

                // Add food to meal session
                if (row.mon_an_id) {
                    groupedData[key].mon_an.push({
                        id: row.mon_an_id,
                        ten_mon_an: row.ten_mon_an,
                        kcal: row.kcal || 0,
                        protein: row.protein || 0,
                        fat: row.fat || 0,
                        carbs: row.carbs || 0,
                        so_khau_phan: row.so_khau_phan || 1
                    });
                }
            });

            return {
                nhom: nhom || 'all',
                ngay: date,
                thuc_don: Object.values(groupedData)
            };

        } catch (error) {
            console.error('Error getting meals by date for API:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ngày: ' + error.message);
        }
    }

    /**
     * Lấy danh sách món ăn cho dropdown (chỉ từ database)
     */
    async getFoodsForDropdown() {
        try {
            console.log('🍽️ getFoodsForDropdown method called');
            const query = `
                SELECT 
                    id,
                    ten_mon_an AS name,
                    total_calories AS kcal,
                    total_protein,
                    total_fat,
                    total_carbs,
                    loai_mon,
                    do_tuoi_phu_hop,
                    trang_thai
                FROM mon_an 
                WHERE trang_thai = 'active'
                ORDER BY loai_mon, ten_mon_an
            `;

            const foods = await this.db.query(query);
            
            if (!foods || foods.length === 0) {
                // Return mock data when database is empty
                const fs = require('fs');
                const path = require('path');
                try {
                    const mockPath = path.join(__dirname, '../data/mock_foods.json');
                    if (fs.existsSync(mockPath)) {
                        const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
                        return mockData.data.foods;
                    }
                } catch (error) {
                    console.warn('Could not load mock foods data:', error.message);
                }
                return [];
            }
            
            return foods.map(food => ({
                id: food.id,
                name: food.name, // Already aliased in SQL
                kcal: food.kcal || 0, // Already aliased in SQL
                total_protein: food.total_protein || 0,
                total_fat: food.total_fat || 0,
                total_carbs: food.total_carbs || 0,
                loai_mon: food.loai_mon,
                do_tuoi_phu_hop: food.do_tuoi_phu_hop
            }));

        } catch (error) {
            console.error('Error getting foods for dropdown:', error);
            throw new Error('Lỗi khi lấy danh sách món ăn: ' + error.message);
        }
    }

    /**
     * Cập nhật thực đơn (cho giáo viên)
     */
    async updateMealPlan(mealId, updateData) {
        try {
            const { ngay_ap_dung, nhom, chi_tiet } = updateData;

            // Validate input
            if (!ngay_ap_dung || !nhom || !chi_tiet || !Array.isArray(chi_tiet)) {
                throw new Error('Thiếu thông tin bắt buộc: ngay_ap_dung, nhom, chi_tiet');
            }

            // Start transaction
            await this.db.query('START TRANSACTION');

            try {
                // 1. Update bua_an basic info
                const updateMealQuery = `
                    UPDATE bua_an 
                    SET ngay_ap_dung = ?, updated_at = NOW()
                    WHERE id = ?
                `;
                await this.db.query(updateMealQuery, [ngay_ap_dung, mealId]);

                // 2. Delete existing chi_tiet_bua_an
                const deleteDetailsQuery = `DELETE FROM chi_tiet_bua_an WHERE bua_an_id = ?`;
                await this.db.query(deleteDetailsQuery, [mealId]);

                // 3. Insert new chi_tiet_bua_an
                for (let i = 0; i < chi_tiet.length; i++) {
                    const detail = chi_tiet[i];
                    const { buoi, id_mon_an, kcal } = detail;

                    if (!buoi || !id_mon_an) {
                        throw new Error(`Chi tiết thứ ${i + 1}: thiếu buoi hoặc id_mon_an`);
                    }

                    // Map buoi to loai_bua_an
                    let loai_bua_an = 'snack'; // default
                    switch (buoi) {
                        case 'sang':
                            loai_bua_an = 'breakfast';
                            break;
                        case 'trua':
                            loai_bua_an = 'lunch';
                            break;
                        case 'xen':
                            loai_bua_an = 'snack';
                            break;
                    }

                    // Update loai_bua_an in bua_an if needed
                    await this.db.query(
                        'UPDATE bua_an SET loai_bua_an = ? WHERE id = ?',
                        [loai_bua_an, mealId]
                    );

                    // Insert chi_tiet_bua_an
                    const insertDetailQuery = `
                        INSERT INTO chi_tiet_bua_an (bua_an_id, mon_an_id, so_khau_phan, thu_tu_phuc_vu)
                        VALUES (?, ?, ?, ?)
                    `;
                    await this.db.query(insertDetailQuery, [mealId, id_mon_an, 25, i + 1]);
                }

                // Commit transaction
                await this.db.query('COMMIT');

                // Return updated meal
                return await this.getMealDetails(mealId);

            } catch (error) {
                // Rollback on error
                await this.db.query('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('Error updating meal plan:', error);
            throw new Error('Lỗi khi cập nhật thực đơn: ' + error.message);
        }
    }

    /**
     * Cập nhật thực đơn mới (theo format từ frontend)
     */
    async updateMealPlanNew(updateData) {
        try {
            const { ngay_ap_dung, nhom, class_id, chi_tiet } = updateData;

            console.log(' updateMealPlanNew called with:', updateData);

            // Validate input - Hỗ trợ 2 formats
            if (!ngay_ap_dung || !chi_tiet || !Array.isArray(chi_tiet)) {
                throw new Error('Thiếu thông tin bắt buộc: ngay_ap_dung, chi_tiet');
            }

            if (!nhom && !class_id) {
                throw new Error('Phải có nhomhoặc class_id');
            }

            // Start transaction
            const connection = await this.db.beginTransaction();

            try {
                // Xác định classes để áp dụng
                let targetClasses = [];
                
                if (class_id) {
                    // Format 2: Áp dụng cho lớp cụ thể
                    targetClasses = [{ class_id: class_id, nhom: null }];
                } else {
                    // Format 1: Áp dụng theo nhóm lớp (class_id = NULL)
                    targetClasses = [{ class_id: null, nhom: nhom }];
                }
                
                for (const target of targetClasses) {
                    for (const detail of chi_tiet) {
                        const { buoi, id_mon_an, kcal } = detail;

                        // Map buoi to database enum values
                        let loai_bua_an;
                        switch (buoi) {
                            case 'sang':
                                loai_bua_an = 'breakfast';
                                break;
                            case 'trua':
                                loai_bua_an = 'lunch';
                                break;
                            case 'xe':
                            case 'xen':
                                loai_bua_an = 'snack';
                                break;
                            default:
                                loai_bua_an = 'breakfast'; // default fallback
                        }

                        // Check if record exists
                        let checkQuery, checkParams;
                        
                        if (target.class_id) {
                            // Kiểm tra theo class_id cụ thể
                            checkQuery = `
                                SELECT id FROM thuc_don 
                                WHERE ngay_ap_dung = ? AND class_id = ? AND loai_bua_an = ?
                            `;
                            checkParams = [ngay_ap_dung, target.class_id, loai_bua_an];
                        } else {
                            // Kiểm tra theo nhom (class_id NULL) - use nhom_lop database field
                            checkQuery = `
                                SELECT id FROM thuc_don 
                                WHERE ngay_ap_dung = ? AND class_id IS NULL AND nhom_lop = ? AND loai_bua_an = ?
                            `;
                            checkParams = [ngay_ap_dung, target.nhom, loai_bua_an];
                        }
                        
                        const [existing] = await connection.execute(checkQuery, checkParams);

                        if (existing && existing.length > 0) {
                            // Delete existing chi_tiet_thuc_don
                            await connection.execute('DELETE FROM chi_tiet_thuc_don WHERE thuc_don_id = ?', [existing[0].id]);
                            
                            // Insert new chi_tiet_thuc_don
                            const insertDetailQuery = `
                                INSERT INTO chi_tiet_thuc_don (thuc_don_id, mon_an_id, so_khau_phan) 
                                VALUES (?, ?, ?)
                            `;
                            await connection.execute(insertDetailQuery, [existing[0].id, id_mon_an, 1]);
                        } else {
                            // Create new thuc_don record với UUID thủ công
                            const { v4: uuidv4 } = require('uuid');
                            const thucDonId = uuidv4();
                            
                            const insertQuery = `
                                INSERT INTO thuc_don (
                                    id, ten_thuc_don, ngay_ap_dung, loai_bua_an, class_id, 
                                    nhom_lop, so_tre_du_kien, trang_thai, created_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                            `;
                            await connection.execute(insertQuery, [
                                thucDonId, `Thực đơn ${buoi}`, ngay_ap_dung, loai_bua_an, target.class_id, 
                                target.nhom, 30, 'active'
                            ]);

                            // Insert chi_tiet_thuc_don với UUID từ thuc_don
                            const insertDetailQuery = `
                                INSERT INTO chi_tiet_thuc_don (thuc_don_id, mon_an_id, so_khau_phan) 
                                VALUES (?, ?, ?)
                            `;
                            await connection.execute(insertDetailQuery, [thucDonId, id_mon_an, 1]);
                        }
                    }
                }

                // Commit transaction
                await this.db.commit(connection);

                return {
                    success: true,
                    message: 'Cập nhật thực đơn thành công',
                    data: { ngay_ap_dung, nhom, class_id, chi_tiet }
                };

            } catch (error) {
                // Rollback on error
                await this.db.rollback(connection);
                throw error;
            }

        } catch (error) {
            console.error('Error updating meal plan new:', error);
            throw new Error('Lỗi khi cập nhật thực đơn: ' + error.message);
        }
    }
}

module.exports = Meal;
