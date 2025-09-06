/**
 * Meal Controller - Business logic cho quản lý bữa ăn và thực đơn
 */

const BaseController = require('./BaseController');
const Meal = require('../models/Meal');

class MealController extends BaseController {
    constructor(db) {
        super();
        this.db = db;
        this.mealModel = new Meal(db);
    }

    /**
     * Tạo thực đơn mới
     */
    async createMeal(mealData) {
        try {
            // Validation
            if (!mealData.ngay || !mealData.buoi_an || !mealData.mon_an_id) {
                throw new Error('Thiếu thông tin bắt buộc: ngày, buổi ăn, món ăn');
            }

            // Kiểm tra buổi ăn hợp lệ
            const validSessions = ['sang', 'trua', 'chieu', 'phu'];
            if (!validSessions.includes(mealData.buoi_an)) {
                throw new Error('Buổi ăn không hợp lệ');
            }

            // Kiểm tra xem đã có thực đơn cho buổi này chưa
            const existingMeal = await this.checkExistingMeal(
                mealData.ngay, 
                mealData.buoi_an, 
                mealData.lop_hoc_id
            );

            if (existingMeal) {
                throw new Error('Đã có thực đơn cho buổi ăn này');
            }

            const meal = await this.mealModel.create(mealData);
            return meal;

        } catch (error) {
            console.error('Error in createMeal:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra thực đơn đã tồn tại
     */
    async checkExistingMeal(date, session, classId) {
        try {
            let query = 'SELECT id FROM thuc_don WHERE ngay = ? AND buoi_an = ?';
            const values = [date, session];

            if (classId) {
                query += ' AND lop_hoc_id = ?';
                values.push(classId);
            } else {
                query += ' AND lop_hoc_id IS NULL';
            }

            const result = await this.db.query(query, values);
            return result.length > 0 ? result[0] : null;

        } catch (error) {
            console.error('Error checking existing meal:', error);
            throw error;
        }
    }

    /**
     * Lấy thực đơn theo ngày
     */
    async getMealsByDate(date, classId = null) {
        try {
            return await this.mealModel.findByDateAndClass(date, classId);

        } catch (error) {
            console.error('Error in getMealsByDate:', error);
            throw error;
        }
    }

    /**
     * Lấy thực đơn theo tuần
     */
    async getWeeklyMeals(startDate, endDate, classId = null) {
        try {
            return await this.mealModel.findByWeek(startDate, endDate, classId);

        } catch (error) {
            console.error('Error in getWeeklyMeals:', error);
            throw error;
        }
    }

    /**
     * Tạo thực đơn cho cả tuần
     */
    async createWeeklyMenu(weeklyMenuData) {
        try {
            // Validation
            if (!weeklyMenuData.start_date || !weeklyMenuData.meals) {
                throw new Error('Thiếu thông tin bắt buộc: start_date, meals');
            }

            if (!Array.isArray(weeklyMenuData.meals) || weeklyMenuData.meals.length === 0) {
                throw new Error('Danh sách meals phải là mảng và không được rỗng');
            }

            // Validate từng meal trong tuần
            for (const meal of weeklyMenuData.meals) {
                if (!meal.date || !meal.session || !meal.food_id) {
                    throw new Error('Mỗi meal phải có date, session và food_id');
                }

                const validSessions = ['sang', 'trua', 'chieu', 'phu'];
                if (!validSessions.includes(meal.session)) {
                    throw new Error(`Buổi ăn '${meal.session}' không hợp lệ`);
                }
            }

            return await this.mealModel.createWeeklyMenu(weeklyMenuData);

        } catch (error) {
            console.error('Error in createWeeklyMenu:', error);
            throw error;
        }
    }

    /**
     * Lấy thông tin thực đơn theo ID
     */
    async getMealById(id) {
        try {
            return await this.mealModel.findById(id);

        } catch (error) {
            console.error('Error in getMealById:', error);
            throw error;
        }
    }

    /**
     * Cập nhật thực đơn
     */
    async updateMeal(id, updateData) {
        try {
            // Validation
            if (updateData.buoi_an) {
                const validSessions = ['sang', 'trua', 'chieu', 'phu'];
                if (!validSessions.includes(updateData.buoi_an)) {
                    throw new Error('Buổi ăn không hợp lệ');
                }
            }

            // Kiểm tra xem thực đơn có tồn tại không
            const existingMeal = await this.mealModel.findById(id);
            if (!existingMeal) {
                throw new Error('Không tìm thấy thực đơn để cập nhật');
            }

            return await this.mealModel.update(id, updateData);

        } catch (error) {
            console.error('Error in updateMeal:', error);
            throw error;
        }
    }

    /**
     * Xóa thực đơn
     */
    async deleteMeal(id) {
        try {
            // Kiểm tra xem thực đơn có tồn tại không
            const existingMeal = await this.mealModel.findById(id);
            if (!existingMeal) {
                throw new Error('Không tìm thấy thực đơn để xóa');
            }

            // Kiểm tra xem có thể xóa không (ví dụ: không xóa thực đơn đã qua)
            const mealDate = new Date(existingMeal.ngay);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (mealDate < today) {
                throw new Error('Không thể xóa thực đơn đã qua');
            }

            return await this.mealModel.delete(id);

        } catch (error) {
            console.error('Error in deleteMeal:', error);
            throw error;
        }
    }

    /**
     * Lấy tóm tắt dinh dưỡng
     */
    async getNutritionSummary(date, classId = null) {
        try {
            return await this.mealModel.getNutritionSummary(date, classId);

        } catch (error) {
            console.error('Error in getNutritionSummary:', error);
            throw error;
        }
    }

    /**
     * Lấy lịch sử thực đơn
     */
    async getMealHistory(filters = {}) {
        try {
            return await this.mealModel.getHistory(filters);

        } catch (error) {
            console.error('Error in getMealHistory:', error);
            throw error;
        }
    }

    /**
     * Lấy thống kê thực đơn
     */
    async getMealStatistics(filters = {}) {
        try {
            // Thống kê số lượng thực đơn theo buổi
            const sessionStats = await this.db.query(`
                SELECT 
                    buoi_an,
                    COUNT(*) as total_meals,
                    AVG(chi_phi_du_kien) as avg_cost,
                    SUM(so_luong_phuc_vu) as total_servings
                FROM thuc_don 
                WHERE ngay BETWEEN ? AND ?
                GROUP BY buoi_an
                ORDER BY buoi_an
            `, [
                filters.start_date || '2024-01-01',
                filters.end_date || new Date().toISOString().split('T')[0]
            ]);

            // Thống kê món ăn phổ biến
            const popularFoods = await this.db.query(`
                SELECT 
                    ma.ten_mon,
                    COUNT(*) as usage_count,
                    AVG(td.chi_phi_du_kien) as avg_cost
                FROM thuc_don td
                JOIN mon_an ma ON td.mon_an_id = ma.id
                WHERE td.ngay BETWEEN ? AND ?
                GROUP BY ma.id, ma.ten_mon
                ORDER BY usage_count DESC
                LIMIT 10
            `, [
                filters.start_date || '2024-01-01',
                filters.end_date || new Date().toISOString().split('T')[0]
            ]);

            // Thống kê chi phí
            const costStats = await this.db.query(`
                SELECT 
                    DATE(ngay) as date,
                    SUM(chi_phi_du_kien) as daily_cost,
                    AVG(chi_phi_du_kien) as avg_meal_cost,
                    COUNT(*) as meal_count
                FROM thuc_don 
                WHERE ngay BETWEEN ? AND ?
                GROUP BY DATE(ngay)
                ORDER BY date DESC
                LIMIT 30
            `, [
                filters.start_date || '2024-01-01',
                filters.end_date || new Date().toISOString().split('T')[0]
            ]);

            return {
                session_stats: sessionStats,
                popular_foods: popularFoods,
                cost_stats: costStats,
                period: {
                    start_date: filters.start_date || '2024-01-01',
                    end_date: filters.end_date || new Date().toISOString().split('T')[0]
                }
            };

        } catch (error) {
            console.error('Error in getMealStatistics:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra xung đột thực đơn
     */
    async validateMealSchedule(mealData) {
        try {
            const conflicts = [];

            // Kiểm tra xung đột nguyên liệu
            const ingredientConflicts = await this.checkIngredientAvailability(
                mealData.ngay, 
                mealData.mon_an_id,
                mealData.so_luong_phuc_vu
            );

            if (ingredientConflicts.length > 0) {
                conflicts.push({
                    type: 'ingredient_shortage',
                    details: ingredientConflicts
                });
            }

            // Kiểm tra cân bằng dinh dưỡng trong ngày
            const nutritionBalance = await this.checkDailyNutritionBalance(
                mealData.ngay,
                mealData.lop_hoc_id
            );

            if (!nutritionBalance.balanced) {
                conflicts.push({
                    type: 'nutrition_imbalance',
                    details: nutritionBalance
                });
            }

            return {
                valid: conflicts.length === 0,
                conflicts
            };

        } catch (error) {
            console.error('Error in validateMealSchedule:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra khả năng cung cấp nguyên liệu
     */
    async checkIngredientAvailability(date, foodId, servingCount) {
        try {
            const query = `
                SELECT 
                    nl.ten_nguyen_lieu,
                    mani.so_luong as required_per_serving,
                    (mani.so_luong * ?) as total_required,
                    kho.so_luong_ton_kho as available,
                    nl.don_vi
                FROM mon_an_nguyen_lieu mani
                JOIN nguyen_lieu nl ON mani.nguyen_lieu_id = nl.id
                LEFT JOIN kho_hang kho ON nl.id = kho.nguyen_lieu_id
                WHERE mani.mon_an_id = ?
                AND (kho.so_luong_ton_kho IS NULL OR kho.so_luong_ton_kho < (mani.so_luong * ?))
            `;

            return await this.db.query(query, [servingCount, foodId, servingCount]);

        } catch (error) {
            console.error('Error checking ingredient availability:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra cân bằng dinh dưỡng trong ngày
     */
    async checkDailyNutritionBalance(date, classId) {
        try {
            const summary = await this.getNutritionSummary(date, classId);
            
            // Chuẩn dinh dưỡng cho trẻ mầm non (theo khuyến nghị)
            const dailyRecommended = {
                calories: 1200, // calories/ngày
                protein: 30,    // gram/ngày
                carbs: 150,     // gram/ngày
                fat: 40         // gram/ngày
            };

            const balance = {
                calories_percent: (summary.daily_total.total_calories / dailyRecommended.calories) * 100,
                protein_percent: (summary.daily_total.total_protein / dailyRecommended.protein) * 100,
                carbs_percent: (summary.daily_total.total_carbs / dailyRecommended.carbs) * 100,
                fat_percent: (summary.daily_total.total_fat / dailyRecommended.fat) * 100
            };

            // Kiểm tra cân bằng (nên trong khoảng 80-120%)
            const balanced = Object.values(balance).every(percent => 
                percent >= 80 && percent <= 120
            );

            return {
                balanced,
                balance,
                recommended: dailyRecommended,
                actual: summary.daily_total
            };

        } catch (error) {
            console.error('Error checking nutrition balance:', error);
            throw error;
        }
    }
}

module.exports = MealController;
