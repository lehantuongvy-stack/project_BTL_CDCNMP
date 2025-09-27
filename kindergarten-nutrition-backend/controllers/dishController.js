const Food = require('../models/Food');
const DatabaseManager = require('../database/DatabaseManager');

class DishController {
    constructor(db = null) {
        console.log('DishController (FIXED) constructor called');
        this.db = db || new DatabaseManager();
        this.foodModel = new Food(this.db);
    }

    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    async getAllDishes(req, res) {
        try {
            const { loai_mon, is_vegetarian, no_allergens, limit, offset } = req.query;
            
            const filters = {};
            if (loai_mon) filters.loai_mon = loai_mon;
            if (is_vegetarian !== undefined) filters.is_vegetarian = is_vegetarian === 'true';
            if (no_allergens === 'true') filters.no_allergens = true;
            if (limit) filters.limit = parseInt(limit);
            if (offset) filters.offset = parseInt(offset);

            const dishes = await this.foodModel.findAll(filters);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Lấy danh sách món ăn thành công',
                data: {
                    dishes,
                    total: dishes.length,
                    filters: filters
                }
            });

        } catch (error) {
            console.error('Error in getAllDishes:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }

    async getDishById(req, res) {
        try {
            const { id } = req.params;
            const dish = await this.foodModel.findById(id);

            if (!dish) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy món ăn'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                message: 'Lấy thông tin món ăn thành công',
                data: { dish }
            });

        } catch (error) {
            console.error('Error in getDishById:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }

    async createDish(req, res) {
        try {
            console.log('DEBUG - req.body:', req.body);
            console.log('DEBUG - req.user:', req.user);

            const { 
                ten_mon_an, 
                loai_mon, 
                mo_ta, 
                do_tuoi_phu_hop,
                thoi_gian_che_bien,
                khau_phan_chuan,
                total_calories,
                total_protein,
                total_fat,
                total_carbs,
                huong_dan_che_bien,
                is_vegetarian 
            } = req.body;

            console.log('DEBUG - ten_mon_an:', ten_mon_an);
            console.log('DEBUG - loai_mon:', loai_mon);

            if (!ten_mon_an || !loai_mon) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Tên món ăn và loại món là bắt buộc'
                });
            }

            const dishData = {
                ten_mon_an,
                loai_mon,
                mo_ta: mo_ta || '',
                do_tuoi_phu_hop: do_tuoi_phu_hop || '3-5 tuổi',
                thoi_gian_che_bien: thoi_gian_che_bien || 30,
                khau_phan_chuan: khau_phan_chuan || 1,
                total_calories: total_calories || 0,
                total_protein: total_protein || 0,
                total_fat: total_fat || 0,
                total_carbs: total_carbs || 0,
                huong_dan_che_bien: huong_dan_che_bien || '',
                is_vegetarian: is_vegetarian === true,
                created_by: req.user?.id || 'd37fd91e-8ab8-11f0-913c-a036bc312358'
            };

            console.log('DEBUG - dishData:', dishData);

            const newDish = await this.foodModel.create(dishData);

            this.sendResponse(res, 201, {
                success: true,
                message: 'Tạo món ăn mới thành công',
                data: { dish: newDish }
            });

        } catch (error) {
            console.error('Error in createDish:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: Lỗi khi tạo món ăn: ' + error.message
            });
        }
    }

    async updateDish(req, res) {
        try {
            const { id } = req.params;
            console.log('UPDATE request for ID:', id);
            console.log('Request body:', req.body);
            
            const existingDish = await this.foodModel.findById(id);
            if (!existingDish) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy món ăn'
                });
            }

            // Filter only valid fields that exist in database schema
            const validFields = [
                'ten_mon_an', 'loai_mon', 'mo_ta', 'do_tuoi_phu_hop',
                'thoi_gian_che_bien', 'khau_phan_chuan', 'total_calories',
                'total_protein', 'total_fat', 'total_carbs', 'huong_dan_che_bien'
            ];

            const updateData = {};
            validFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            });

            console.log('Filtered updateData:', updateData);

            if (Object.keys(updateData).length === 0) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Không có dữ liệu hợp lệ để cập nhật'
                });
            }

            const updatedDish = await this.foodModel.update(id, updateData);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Cập nhật món ăn thành công',
                data: { dish: updatedDish }
            });

        } catch (error) {
            console.error('Error in updateDish:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }

    async deleteDish(req, res) {
        try {
            const { id } = req.params;
            console.log('DELETE request for ID:', id);
            
            const existingDish = await this.foodModel.findById(id);
            console.log('Found dish:', existingDish);
            
            if (!existingDish) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy món ăn'
                });
            }

            console.log('Deleting dish with ID:', id);
            await this.foodModel.delete(id);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Xóa món ăn thành công'
            });

        } catch (error) {
            console.error('Error in deleteDish:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }

    async searchDishes(req, res) {
        try {
            const { keyword } = req.params;
            const dishes = await this.foodModel.search(keyword);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Tìm kiếm món ăn thành công',
                data: {
                    dishes,
                    total: dishes.length,
                    keyword: keyword
                }
            });

        } catch (error) {
            console.error('Error in searchDishes:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }

    async addIngredientToDish(req, res) {
        try {
            const { id } = req.params;
            const { ingredient_id, so_luong } = req.body;

            if (!ingredient_id || !so_luong) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'ID nguyên liệu và số lượng là bắt buộc'
                });
            }

            await this.foodModel.addIngredient(id, ingredient_id, so_luong);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Thêm nguyên liệu vào món ăn thành công'
            });

        } catch (error) {
            console.error('Error in addIngredientToDish:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }

    async getNutritionStats(req, res) {
        try {
            const stats = await this.foodModel.getNutritionStats();

            this.sendResponse(res, 200, {
                success: true,
                message: 'Lấy thống kê dinh dưỡng thành công',
                data: { stats }
            });

        } catch (error) {
            console.error('Error in getNutritionStats:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    }
}

module.exports = DishController;
