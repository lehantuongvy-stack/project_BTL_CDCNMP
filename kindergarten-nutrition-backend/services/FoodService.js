/**
 * Food Service
 * Quản lý thông tin thực phẩm
 */

const { v4: uuidv4 } = require('uuid');

class FoodService {
    constructor(db) {
        this.db = db;
    }

    // Lấy tất cả thực phẩm
    async getAllFoods() {
        try {
            const foods = await this.db.select(`
                SELECT * FROM foods 
                WHERE is_active = true
                ORDER BY category, name ASC
            `);

            // Parse JSON fields
            const processedFoods = foods.map(food => {
                if (food.vitamins) {
                    food.vitamins = JSON.parse(food.vitamins);
                }
                if (food.minerals) {
                    food.minerals = JSON.parse(food.minerals);
                }
                if (food.allergens) {
                    food.allergens = JSON.parse(food.allergens);
                }
                return food;
            });

            return {
                success: true,
                data: processedFoods,
                count: processedFoods.length
            };
        } catch (error) {
            console.error(' Get all foods error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách thực phẩm'
            };
        }
    }

    // Tạo thực phẩm mới
    async createFood(foodData) {
        try {
            const {
                name,
                category,
                caloriesPer100g,
                proteinPer100g,
                fatPer100g,
                carbsPer100g,
                fiberPer100g,
                sugarPer100g,
                sodiumPer100g,
                vitamins = {},
                minerals = {},
                allergens = [],
                description
            } = foodData;

            // Validation
            if (!name || !category) {
                return {
                    success: false,
                    message: 'Tên và danh mục thực phẩm không được để trống'
                };
            }

            // Kiểm tra tên thực phẩm đã tồn tại
            const existingFood = await this.db.findWhere('foods', { name });
            if (existingFood.length > 0) {
                return {
                    success: false,
                    message: 'Tên thực phẩm đã tồn tại'
                };
            }

            // Tạo record mới
            const newFood = {
                id: uuidv4(),
                name,
                category,
                calories_per_100g: caloriesPer100g || null,
                protein_per_100g: proteinPer100g || null,
                fat_per_100g: fatPer100g || null,
                carbs_per_100g: carbsPer100g || null,
                fiber_per_100g: fiberPer100g || null,
                sugar_per_100g: sugarPer100g || null,
                sodium_per_100g: sodiumPer100g || null,
                vitamins: JSON.stringify(vitamins),
                minerals: JSON.stringify(minerals),
                allergens: JSON.stringify(allergens),
                description: description || null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await this.db.create('foods', newFood);

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Tạo thực phẩm thành công',
                    data: {
                        id: newFood.id,
                        name,
                        category
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Tạo thực phẩm thất bại'
                };
            }

        } catch (error) {
            console.error('Create food error:', error);
            return {
                success: false,
                message: 'Lỗi server khi tạo thực phẩm'
            };
        }
    }

    // Lấy thông tin thực phẩm theo ID
    async getFoodById(foodId) {
        try {
            const food = await this.db.findById('foods', foodId);
            
            if (!food || !food.is_active) {
                return {
                    success: false,
                    message: 'Không tìm thấy thực phẩm'
                };
            }

            // Parse JSON fields
            if (food.vitamins) {
                food.vitamins = JSON.parse(food.vitamins);
            }
            if (food.minerals) {
                food.minerals = JSON.parse(food.minerals);
            }
            if (food.allergens) {
                food.allergens = JSON.parse(food.allergens);
            }

            return {
                success: true,
                data: food
            };
        } catch (error) {
            console.error('Get food by ID error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin thực phẩm'
            };
        }
    }

    // Cập nhật thông tin thực phẩm
    async updateFood(foodId, updateData) {
        try {
            const allowedFields = [
                'name', 'category', 'calories_per_100g', 'protein_per_100g',
                'fat_per_100g', 'carbs_per_100g', 'fiber_per_100g',
                'sugar_per_100g', 'sodium_per_100g', 'vitamins',
                'minerals', 'allergens', 'description'
            ];
            
            const filteredData = {};
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    if (['vitamins', 'minerals', 'allergens'].includes(field)) {
                        filteredData[field] = JSON.stringify(updateData[field]);
                    } else {
                        filteredData[field] = updateData[field];
                    }
                }
            }

            if (Object.keys(filteredData).length === 0) {
                return {
                    success: false,
                    message: 'Không có dữ liệu để cập nhật'
                };
            }

            filteredData.updated_at = new Date();

            const result = await this.db.updateById('foods', foodId, filteredData);

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Cập nhật thông tin thực phẩm thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy thực phẩm để cập nhật'
                };
            }
        } catch (error) {
            console.error('Update food error:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật thông tin thực phẩm'
            };
        }
    }

    // Lấy danh sách thực phẩm theo danh mục
    async getFoodsByCategory(category) {
        try {
            const foods = await this.db.findWhere('foods', {
                category,
                is_active: true
            }, 'name ASC');

            return {
                success: true,
                data: foods,
                count: foods.length
            };
        } catch (error) {
            console.error('Get foods by category error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách thực phẩm theo danh mục'
            };
        }
    }

    // Tìm kiếm thực phẩm
    async searchFoods(searchTerm) {
        try {
            const foods = await this.db.select(`
                SELECT * FROM foods 
                WHERE is_active = true 
                AND (
                    name LIKE ? OR 
                    category LIKE ? OR
                    description LIKE ?
                )
                ORDER BY name ASC
            `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

            return {
                success: true,
                data: foods,
                count: foods.length
            };
        } catch (error) {
            console.error('Search foods error:', error);
            return {
                success: false,
                message: 'Lỗi khi tìm kiếm thực phẩm'
            };
        }
    }

    // Lấy danh sách danh mục thực phẩm
    async getFoodCategories() {
        try {
            const categories = await this.db.select(`
                SELECT 
                    category,
                    COUNT(*) as count
                FROM foods 
                WHERE is_active = true
                GROUP BY category
                ORDER BY category ASC
            `);

            return {
                success: true,
                data: categories
            };
        } catch (error) {
            console.error('Get food categories error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách danh mục thực phẩm'
            };
        }
    }

    // Xóa thực phẩm (soft delete)
    async deleteFood(foodId) {
        try {
            const result = await this.db.updateById('foods', foodId, {
                is_active: false,
                updated_at: new Date()
            });

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Xóa thực phẩm thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy thực phẩm để xóa'
                };
            }
        } catch (error) {
            console.error('Delete food error:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa thực phẩm'
            };
        }
    }

    // Thống kê thực phẩm
    async getFoodStats() {
        try {
            const stats = await this.db.select(`
                SELECT 
                    category,
                    COUNT(*) as count,
                    AVG(calories_per_100g) as avg_calories,
                    AVG(protein_per_100g) as avg_protein
                FROM foods 
                WHERE is_active = true
                GROUP BY category
                ORDER BY category
            `);

            const totalCount = await this.db.count('foods', { is_active: true });

            return {
                success: true,
                data: {
                    total: totalCount,
                    byCategory: stats
                }
            };
        } catch (error) {
            console.error('Get food stats error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê thực phẩm'
            };
        }
    }
}

module.exports = FoodService;
