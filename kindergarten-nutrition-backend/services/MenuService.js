/**
 * Menu Service - Quản lý thực đơn
 * Sử dụng Database Schema
 */

class MenuService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    // Tạo thực đơn mới
    async createMenu(data, user) {
        try {
            // Validate quyền
            if (!['admin', 'nutritionist', 'teacher'].includes(user.role)) {
                throw new Error('Không có quyền tạo thực đơn');
            }

            // Validate required fields
            if (!data.ten_thuc_don || !data.ngay_ap_dung || !data.loai_bua_an) {
                throw new Error('Tên thực đơn, ngày áp dụng và loại bữa ăn là bắt buộc');
            }

            // Validate loại bữa ăn
            const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
            if (!validMealTypes.includes(data.loai_bua_an)) {
                throw new Error('Loại bữa ăn không hợp lệ');
            }

            // Tạo thực đơn
            const menu = await this.db.createThucDon({
                ten_thuc_don: data.ten_thuc_don,
                ngay_ap_dung: data.ngay_ap_dung,
                loai_bua_an: data.loai_bua_an,
                lop_ap_dung: data.lop_ap_dung || null,
                so_tre_du_kien: parseInt(data.so_tre_du_kien) || 0,
                ghi_chu: data.ghi_chu || null,
                created_by: user.id
            });

            return {
                success: true,
                message: 'Tạo thực đơn thành công',
                data: menu
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Lấy thực đơn theo ngày
    async getMenusByDate(date, filters = {}, user) {
        try {
            const menus = await this.db.getThucDonByDate(date, filters);
            
            // Role-based filtering
            let filteredMenus = menus;
            if (user.role === 'parent') {
                // Parent chỉ xem thực đơn của lớp con mình
                const childrenClasses = await this.getChildrenClasses(user.id);
                filteredMenus = menus.filter(menu => 
                    !menu.lop_ap_dung || childrenClasses.includes(menu.lop_ap_dung)
                );
            }

            return {
                success: true,
                message: `Thực đơn ngày ${date}`,
                data: filteredMenus,
                count: filteredMenus.length
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Lấy lớp học của con (cho parent)
    async getChildrenClasses(parentId) {
        try {
            const children = await this.db.getChildrenByParentId(parentId);
            return children.map(child => child.class_name).filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    // Tính toán dinh dưỡng tổng của thực đơn
    async calculateMenuNutrition(menuId) {
        try {
            const nutrition = await this.db.getNutritionStatsByMenu(menuId);
            
            if (!nutrition) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin dinh dưỡng cho thực đơn này'
                };
            }

            // Tính phần trăm khuyến nghị hàng ngày (cho trẻ 3-5 tuổi)
            const dailyRecommended = {
                calories: 1400, // kcal
                protein: 20,    // g
                fat: 45,        // g
                carbs: 175      // g
            };

            const percentages = {
                calories: Math.round((nutrition.tong_calories / dailyRecommended.calories) * 100),
                protein: Math.round((nutrition.tong_protein / dailyRecommended.protein) * 100),
                fat: Math.round((nutrition.tong_fat / dailyRecommended.fat) * 100),
                carbs: Math.round((nutrition.tong_carbs / dailyRecommended.carbs) * 100)
            };

            return {
                success: true,
                data: {
                    ...nutrition,
                    daily_percentages: percentages,
                    recommended_daily: dailyRecommended
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Tạo thực đơn tuần
    async createWeeklyMenu(weekData, user) {
        try {
            if (!['admin', 'nutritionist'].includes(user.role)) {
                throw new Error('Chỉ admin và chuyên viên dinh dưỡng mới có thể tạo thực đơn tuần');
            }

            const results = [];
            const connection = await this.db.beginTransaction();

            try {
                for (const dayMenu of weekData.days) {
                    for (const meal of dayMenu.meals) {
                        const menuData = {
                            ten_thuc_don: `${dayMenu.date} - ${this.getMealTypeName(meal.loai_bua_an)}`,
                            ngay_ap_dung: dayMenu.date,
                            loai_bua_an: meal.loai_bua_an,
                            lop_ap_dung: weekData.lop_ap_dung || null,
                            so_tre_du_kien: weekData.so_tre_du_kien || 0,
                            ghi_chu: `Thực đơn tuần ${weekData.week_name}`,
                            created_by: user.id
                        };

                        const menu = await this.db.createThucDon(menuData);
                        results.push(menu);
                    }
                }

                await this.db.commit(connection);

                return {
                    success: true,
                    message: `Tạo thành công thực đơn tuần ${weekData.week_name}`,
                    data: results,
                    count: results.length
                };
            } catch (error) {
                await this.db.rollback(connection);
                throw error;
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Helper: Lấy tên bữa ăn
    getMealTypeName(mealType) {
        const mealNames = {
            'breakfast': 'Bữa sáng',
            'lunch': 'Bữa trưa',
            'dinner': 'Bữa tối',
            'snack': 'Bữa phụ'
        };
        return mealNames[mealType] || mealType;
    }

    // Kiểm tra xung đột dị ứng trong thực đơn
    async checkMenuAllergies(menuId, childId) {
        try {
            // Lấy thông tin dị ứng của trẻ
            const child = await this.db.query('SELECT allergies FROM children WHERE id = ?', [childId]);
            if (!child.length) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin trẻ em'
                };
            }

            const childAllergies = JSON.parse(child[0].allergies || '[]');
            if (!childAllergies.length) {
                return {
                    success: true,
                    message: 'Trẻ không có dị ứng nào',
                    data: { safe: true, conflicts: [] }
                };
            }

            // Lấy các món ăn trong thực đơn và nguyên liệu
            const sql = `
                SELECT 
                    ma.ten_mon_an,
                    nl.ten_nguyen_lieu,
                    nl.allergens
                FROM thuc_don td
                JOIN chi_tiet_thuc_don cttd ON td.id = cttd.thuc_don_id
                JOIN mon_an ma ON cttd.mon_an_id = ma.id
                JOIN chi_tiet_mon_an ctma ON ma.id = ctma.mon_an_id
                JOIN nguyen_lieu nl ON ctma.nguyen_lieu_id = nl.id
                WHERE td.id = ?
            `;

            const ingredients = await this.db.query(sql, [menuId]);
            const conflicts = [];

            for (const ingredient of ingredients) {
                const ingredientAllergens = JSON.parse(ingredient.allergens || '[]');
                const allergyConflicts = ingredientAllergens.filter(allergen =>
                    childAllergies.some(childAllergy =>
                        childAllergy.toLowerCase().includes(allergen.toLowerCase()) ||
                        allergen.toLowerCase().includes(childAllergy.toLowerCase())
                    )
                );

                if (allergyConflicts.length > 0) {
                    conflicts.push({
                        mon_an: ingredient.ten_mon_an,
                        nguyen_lieu: ingredient.ten_nguyen_lieu,
                        allergens: allergyConflicts
                    });
                }
            }

            return {
                success: true,
                data: {
                    safe: conflicts.length === 0,
                    conflicts: conflicts,
                    child_allergies: childAllergies
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Gợi ý thực đơn dựa trên dinh dưỡng
    async suggestMenuByNutrition(targetNutrition, constraints = {}) {
        try {
            // Lấy danh sách món ăn phù hợp
            const dishes = await this.db.getAllMonAn({
                loai_mon: constraints.meal_type || null
            });

            // Thuật toán đơn giản để tìm combo món ăn phù hợp
            const suggestions = this.findNutritionCombination(dishes, targetNutrition);

            return {
                success: true,
                message: 'Gợi ý thực đơn dựa trên dinh dưỡng',
                data: {
                    target: targetNutrition,
                    suggestions: suggestions.slice(0, 5) // Top 5 suggestions
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Helper: Tìm combo món ăn phù hợp với dinh dưỡng mục tiêu
    findNutritionCombination(dishes, target) {
        const combinations = [];
        
        // Thuật toán đơn giản: thử các combo 2-3 món
        for (let i = 0; i < dishes.length; i++) {
            for (let j = i + 1; j < dishes.length; j++) {
                const combo = [dishes[i], dishes[j]];
                const totalNutrition = this.calculateComboNutrition(combo);
                const score = this.calculateNutritionScore(totalNutrition, target);
                
                combinations.push({
                    dishes: combo,
                    nutrition: totalNutrition,
                    score: score
                });
            }
        }

        // Sắp xếp theo điểm số (cao nhất = phù hợp nhất)
        return combinations
            .sort((a, b) => b.score - a.score)
            .map(combo => ({
                dishes: combo.dishes.map(dish => ({
                    id: dish.id,
                    ten_mon_an: dish.ten_mon_an,
                    loai_mon: dish.loai_mon
                })),
                nutrition: combo.nutrition,
                score: Math.round(combo.score * 100) / 100
            }));
    }

    // Helper: Tính dinh dưỡng tổng của combo
    calculateComboNutrition(dishes) {
        return dishes.reduce((total, dish) => ({
            calories: total.calories + (dish.total_calories || 0),
            protein: total.protein + (dish.total_protein || 0),
            fat: total.fat + (dish.total_fat || 0),
            carbs: total.carbs + (dish.total_carbs || 0)
        }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
    }

    // Helper: Tính điểm phù hợp với mục tiêu dinh dưỡng
    calculateNutritionScore(actual, target) {
        const weights = { calories: 0.4, protein: 0.25, fat: 0.2, carbs: 0.15 };
        let score = 0;

        for (const [nutrient, weight] of Object.entries(weights)) {
            if (target[nutrient] > 0) {
                const ratio = Math.min(actual[nutrient] / target[nutrient], 2); // Cap at 2x target
                const deviation = Math.abs(1 - ratio);
                score += weight * (1 - deviation);
            }
        }

        return Math.max(0, score); // Ensure non-negative score
    }
}

module.exports = MenuService;
