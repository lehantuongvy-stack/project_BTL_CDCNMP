/**
 * Ingredient Service - Quản lý nguyên liệu
 * Sử dụng Database Schema
 */

class IngredientService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    // Tạo nguyên liệu mới
    async createIngredient(data, user) {
        try {
            // Validate quyền
            if (!['admin', 'nutritionist', 'teacher'].includes(user.role)) {
                throw new Error('Không có quyền tạo nguyên liệu');
            }

            // Validate required fields
            if (!data.ten_nguyen_lieu) {
                throw new Error('Tên nguyên liệu là bắt buộc');
            }

            // Tạo nguyên liệu
            const ingredient = await this.db.createNguyenLieu({
                ten_nguyen_lieu: data.ten_nguyen_lieu,
                mo_ta: data.mo_ta || null,
                don_vi_tinh: data.don_vi_tinh || 'kg',
                gia_mua: parseFloat(data.gia_mua) || 0,
                calories_per_100g: parseFloat(data.calories_per_100g) || 0,
                protein_per_100g: parseFloat(data.protein_per_100g) || 0,
                fat_per_100g: parseFloat(data.fat_per_100g) || 0,
                carbs_per_100g: parseFloat(data.carbs_per_100g) || 0,
                fiber_per_100g: parseFloat(data.fiber_per_100g) || 0,
                vitamin_a: parseFloat(data.vitamin_a) || 0,
                vitamin_c: parseFloat(data.vitamin_c) || 0,
                calcium: parseFloat(data.calcium) || 0,
                iron: parseFloat(data.iron) || 0,
                allergens: Array.isArray(data.allergens) ? data.allergens : [],
                nha_cung_cap_id: data.nha_cung_cap_id || null
            });

            // Tạo inventory record nếu cần
            if (data.so_luong_ton !== undefined) {
                await this.db.updateInventory(ingredient.id, parseFloat(data.so_luong_ton) || 0);
            }

            return {
                success: true,
                message: 'Tạo nguyên liệu thành công',
                data: ingredient
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Lấy danh sách nguyên liệu
    async getIngredients(filters = {}, user) {
        try {
            const ingredients = await this.db.getAllNguyenLieu(filters);
            
            return {
                success: true,
                message: `Danh sách nguyên liệu (${user.role})`,
                data: ingredients,
                count: ingredients.length
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Tính toán dinh dưỡng cho số lượng cụ thể
    calculateNutrition(ingredient, quantity_grams) {
        const multiplier = quantity_grams / 100;
        
        return {
            calories: (ingredient.calories_per_100g || 0) * multiplier,
            protein: (ingredient.protein_per_100g || 0) * multiplier,
            fat: (ingredient.fat_per_100g || 0) * multiplier,
            carbs: (ingredient.carbs_per_100g || 0) * multiplier,
            fiber: (ingredient.fiber_per_100g || 0) * multiplier,
            vitamin_a: (ingredient.vitamin_a || 0) * multiplier,
            vitamin_c: (ingredient.vitamin_c || 0) * multiplier,
            calcium: (ingredient.calcium || 0) * multiplier,
            iron: (ingredient.iron || 0) * multiplier
        };
    }

    // Kiểm tra dị ứng
    checkAllergies(ingredient, child_allergies = []) {
        const ingredient_allergens = Array.isArray(ingredient.allergens) 
            ? ingredient.allergens 
            : JSON.parse(ingredient.allergens || '[]');
            
        const conflicts = ingredient_allergens.filter(allergen => 
            child_allergies.some(child_allergy => 
                child_allergy.toLowerCase().includes(allergen.toLowerCase()) ||
                allergen.toLowerCase().includes(child_allergy.toLowerCase())
            )
        );
        
        return {
            has_conflict: conflicts.length > 0,
            conflicts: conflicts
        };
    }
}

module.exports = IngredientService;
