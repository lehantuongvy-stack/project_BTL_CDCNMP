/**
 * Meal Service
 * Quản lý thông tin bữa ăn
 */

const { v4: uuidv4 } = require('uuid');

class MealService {
    constructor(db) {
        this.db = db;
    }

    // Lấy tất cả bữa ăn
    async getAllMeals() {
        try {
            const meals = await this.db.select(`
                SELECT 
                    m.*,
                    creator.full_name as created_by_name,
                    approver.full_name as approved_by_name
                FROM meals m
                LEFT JOIN users creator ON m.created_by = creator.id
                LEFT JOIN users approver ON m.approved_by = approver.id
                WHERE m.is_active = true
                ORDER BY m.date DESC, m.meal_type ASC
            `);

            return {
                success: true,
                data: meals,
                count: meals.length
            };
        } catch (error) {
            console.error('❌ Get all meals error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách bữa ăn'
            };
        }
    }

    // Tạo bữa ăn mới
    async createMeal(mealData) {
        try {
            const {
                name,
                mealType,
                date,
                description,
                ageGroup,
                createdBy,
                foods = [] // Array of {foodId, quantity, preparationMethod}
            } = mealData;

            // Validation
            if (!name || !mealType || !date) {
                return {
                    success: false,
                    message: 'Tên, loại bữa ăn và ngày không được để trống'
                };
            }

            // Kiểm tra trùng lặp bữa ăn
            const existingMeal = await this.db.findWhere('meals', {
                meal_type: mealType,
                date: date,
                age_group: ageGroup || null
            });

            if (existingMeal.length > 0) {
                return {
                    success: false,
                    message: 'Bữa ăn này đã tồn tại cho ngày và độ tuổi đã chọn'
                };
            }

            // Bắt đầu transaction
            await this.db.beginTransaction();

            try {
                // Tạo meal record
                const mealId = uuidv4();
                const newMeal = {
                    id: mealId,
                    name,
                    meal_type: mealType,
                    date,
                    description: description || null,
                    age_group: ageGroup || null,
                    created_by: createdBy || null,
                    approval_status: 'pending',
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                await this.db.create('meals', newMeal);

                // Tạo meal items nếu có
                if (foods && foods.length > 0) {
                    for (const food of foods) {
                        const mealItem = {
                            id: uuidv4(),
                            meal_id: mealId,
                            food_id: food.foodId,
                            quantity: food.quantity,
                            preparation_method: food.preparationMethod || null,
                            notes: food.notes || null,
                            created_at: new Date()
                        };
                        await this.db.create('meal_items', mealItem);
                    }

                    // Tính toán thông tin dinh dưỡng
                    await this.calculateMealNutrition(mealId);
                }

                await this.db.commit();

                return {
                    success: true,
                    message: 'Tạo bữa ăn thành công',
                    data: {
                        id: mealId,
                        name,
                        mealType,
                        date
                    }
                };

            } catch (error) {
                await this.db.rollback();
                throw error;
            }

        } catch (error) {
            console.error('❌ Create meal error:', error);
            return {
                success: false,
                message: 'Lỗi server khi tạo bữa ăn'
            };
        }
    }

    // Lấy thông tin bữa ăn theo ID
    async getMealById(mealId) {
        try {
            // Lấy thông tin meal
            const meals = await this.db.select(`
                SELECT 
                    m.*,
                    creator.full_name as created_by_name,
                    approver.full_name as approved_by_name
                FROM meals m
                LEFT JOIN users creator ON m.created_by = creator.id
                LEFT JOIN users approver ON m.approved_by = approver.id
                WHERE m.id = ? AND m.is_active = true
            `, [mealId]);

            if (meals.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy bữa ăn'
                };
            }

            const meal = meals[0];

            // Lấy danh sách foods trong meal
            const mealItems = await this.db.select(`
                SELECT 
                    mi.*,
                    f.name as food_name,
                    f.category as food_category,
                    f.calories_per_100g,
                    f.protein_per_100g,
                    f.fat_per_100g,
                    f.carbs_per_100g
                FROM meal_items mi
                JOIN foods f ON mi.food_id = f.id
                WHERE mi.meal_id = ?
                ORDER BY f.category, f.name
            `, [mealId]);

            meal.foods = mealItems;

            return {
                success: true,
                data: meal
            };
        } catch (error) {
            console.error('❌ Get meal by ID error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin bữa ăn'
            };
        }
    }

    // Tính toán thông tin dinh dưỡng cho bữa ăn
    async calculateMealNutrition(mealId) {
        try {
            const nutritionData = await this.db.select(`
                SELECT 
                    SUM((f.calories_per_100g * mi.quantity) / 100) as total_calories,
                    SUM((f.protein_per_100g * mi.quantity) / 100) as total_protein,
                    SUM((f.fat_per_100g * mi.quantity) / 100) as total_fat,
                    SUM((f.carbs_per_100g * mi.quantity) / 100) as total_carbs
                FROM meal_items mi
                JOIN foods f ON mi.food_id = f.id
                WHERE mi.meal_id = ?
            `, [mealId]);

            if (nutritionData.length > 0) {
                const nutrition = nutritionData[0];
                
                await this.db.updateById('meals', mealId, {
                    total_calories: nutrition.total_calories || 0,
                    total_protein: nutrition.total_protein || 0,
                    total_fat: nutrition.total_fat || 0,
                    total_carbs: nutrition.total_carbs || 0,
                    updated_at: new Date()
                });
            }

        } catch (error) {
            console.error('❌ Calculate meal nutrition error:', error);
        }
    }

    // Phê duyệt bữa ăn
    async approveMeal(mealId, approverId, status) {
        try {
            if (!['approved', 'rejected'].includes(status)) {
                return {
                    success: false,
                    message: 'Trạng thái phê duyệt không hợp lệ'
                };
            }

            const result = await this.db.updateById('meals', mealId, {
                approval_status: status,
                approved_by: approverId,
                updated_at: new Date()
            });

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: `${status === 'approved' ? 'Phê duyệt' : 'Từ chối'} bữa ăn thành công`
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy bữa ăn để phê duyệt'
                };
            }
        } catch (error) {
            console.error('❌ Approve meal error:', error);
            return {
                success: false,
                message: 'Lỗi khi phê duyệt bữa ăn'
            };
        }
    }

    // Lấy bữa ăn theo ngày
    async getMealsByDate(date, mealType = null) {
        try {
            let query = `
                SELECT 
                    m.*,
                    creator.full_name as created_by_name
                FROM meals m
                LEFT JOIN users creator ON m.created_by = creator.id
                WHERE m.date = ? AND m.is_active = true
            `;
            const params = [date];

            if (mealType) {
                query += ' AND m.meal_type = ?';
                params.push(mealType);
            }

            query += ' ORDER BY m.meal_type ASC';

            const meals = await this.db.select(query, params);

            return {
                success: true,
                data: meals,
                count: meals.length
            };
        } catch (error) {
            console.error('❌ Get meals by date error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách bữa ăn theo ngày'
            };
        }
    }

    // Lấy thực đơn tuần
    async getWeeklyMenu(startDate, endDate) {
        try {
            const meals = await this.db.select(`
                SELECT 
                    m.*,
                    creator.full_name as created_by_name
                FROM meals m
                LEFT JOIN users creator ON m.created_by = creator.id
                WHERE m.date BETWEEN ? AND ? 
                AND m.is_active = true
                AND m.approval_status = 'approved'
                ORDER BY m.date ASC, m.meal_type ASC
            `, [startDate, endDate]);

            // Nhóm theo ngày
            const menuByDate = {};
            meals.forEach(meal => {
                if (!menuByDate[meal.date]) {
                    menuByDate[meal.date] = [];
                }
                menuByDate[meal.date].push(meal);
            });

            return {
                success: true,
                data: menuByDate
            };
        } catch (error) {
            console.error('❌ Get weekly menu error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thực đơn tuần'
            };
        }
    }

    // Thống kê bữa ăn
    async getMealStats() {
        try {
            const stats = await this.db.select(`
                SELECT 
                    meal_type,
                    approval_status,
                    COUNT(*) as count,
                    AVG(total_calories) as avg_calories
                FROM meals 
                WHERE is_active = true
                GROUP BY meal_type, approval_status
                ORDER BY meal_type, approval_status
            `);

            const totalCount = await this.db.count('meals', { is_active: true });

            return {
                success: true,
                data: {
                    total: totalCount,
                    breakdown: stats
                }
            };
        } catch (error) {
            console.error('❌ Get meal stats error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê bữa ăn'
            };
        }
    }
}

module.exports = MealService;
