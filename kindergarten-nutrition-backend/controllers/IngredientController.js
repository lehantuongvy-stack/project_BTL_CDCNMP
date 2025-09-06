/**
 * Ingredient Controller
 * Xử lý logic quản lý nguyên liệu
 */

const BaseController = require('./BaseController');
const Ingredient = require('../models/Ingredient');

class IngredientController extends BaseController {
    constructor(db) {
        super();
        this.db = db;
        this.ingredientModel = new Ingredient(db);
    }

    // Lấy danh sách nguyên liệu
    async getIngredients(req, res) {
        try {
            const { page = 1, limit = 50, category, supplier } = req.query;
            const offset = (page - 1) * limit;

            let ingredients;
            const filters = {};

            if (category) filters.category = category;
            if (supplier) filters.supplier = supplier;
            if (limit) filters.limit = parseInt(limit);

            if (Object.keys(filters).length > 0) {
                ingredients = await this.ingredientModel.findWithFilters(filters);
            } else {
                ingredients = await this.ingredientModel.findAll(parseInt(limit), offset);
            }

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    ingredients,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: ingredients.length
                    }
                }
            });

        } catch (error) {
            console.error('Get ingredients error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách nguyên liệu',
                error: error.message
            });
        }
    }

    // Lấy nguyên liệu theo ID
    async getIngredientById(req, res) {
        try {
            const { id } = req.params;

            const ingredient = await this.ingredientModel.findById(id);
            if (!ingredient) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy nguyên liệu'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                data: { ingredient }
            });

        } catch (error) {
            console.error('Get ingredient by ID error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thông tin nguyên liệu',
                error: error.message
            });
        }
    }

    // Tạo nguyên liệu mới
    async createIngredient(req, res) {
        try {
            const ingredientData = req.body;

            // Validate required fields
            const requiredFields = ['ten_nguyen_lieu', 'loai_nguyen_lieu', 'don_vi_tinh'];
            for (const field of requiredFields) {
                if (!ingredientData[field]) {
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: `Trường ${field} là bắt buộc`
                    });
                }
            }

            const newIngredient = await this.ingredientModel.create(ingredientData);

            this.sendResponse(res, 201, {
                success: true,
                message: 'Tạo nguyên liệu thành công',
                data: { ingredient: newIngredient }
            });

        } catch (error) {
            console.error('Create ingredient error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi tạo nguyên liệu',
                error: error.message
            });
        }
    }

    // Cập nhật nguyên liệu
    async updateIngredient(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Kiểm tra nguyên liệu tồn tại
            const existingIngredient = await this.ingredientModel.findById(id);
            if (!existingIngredient) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy nguyên liệu'
                });
            }

            const updatedIngredient = await this.ingredientModel.updateById(id, updateData);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Cập nhật nguyên liệu thành công',
                data: { ingredient: updatedIngredient }
            });

        } catch (error) {
            console.error('Update ingredient error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi cập nhật nguyên liệu',
                error: error.message
            });
        }
    }

    // Cập nhật tồn kho
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, operation = 'set' } = req.body;

            if (quantity === undefined || quantity === null) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Quantity là bắt buộc'
                });
            }

            // Kiểm tra nguyên liệu tồn tại
            const existingIngredient = await this.ingredientModel.findById(id);
            if (!existingIngredient) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy nguyên liệu'
                });
            }

            const updatedIngredient = await this.ingredientModel.updateStock(id, quantity, operation);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Cập nhật tồn kho thành công',
                data: { ingredient: updatedIngredient }
            });

        } catch (error) {
            console.error('Update stock error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi cập nhật tồn kho',
                error: error.message
            });
        }
    }

    // Xóa nguyên liệu
    async deleteIngredient(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra nguyên liệu tồn tại
            const existingIngredient = await this.ingredientModel.findById(id);
            if (!existingIngredient) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy nguyên liệu'
                });
            }

            await this.ingredientModel.deleteById(id);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Xóa nguyên liệu thành công'
            });

        } catch (error) {
            console.error('Delete ingredient error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi xóa nguyên liệu',
                error: error.message
            });
        }
    }

    // Tìm kiếm nguyên liệu
    async searchIngredients(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Query parameter "q" is required'
                });
            }

            const ingredients = await this.ingredientModel.findByName(q);

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    ingredients,
                    total: ingredients.length
                }
            });

        } catch (error) {
            console.error('Search ingredients error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi tìm kiếm nguyên liệu',
                error: error.message
            });
        }
    }

    // Lấy danh sách categories
    async getCategories(req, res) {
        try {
            const categories = await this.ingredientModel.getCategories();

            this.sendResponse(res, 200, {
                success: true,
                data: { categories }
            });

        } catch (error) {
            console.error('Get categories error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách categories',
                error: error.message
            });
        }
    }

    // Lấy danh sách suppliers
    async getSuppliers(req, res) {
        try {
            const suppliers = await this.ingredientModel.getSuppliers();

            this.sendResponse(res, 200, {
                success: true,
                data: { suppliers }
            });

        } catch (error) {
            console.error('Get suppliers error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách suppliers',
                error: error.message
            });
        }
    }

    // Lấy nguyên liệu tồn kho thấp
    async getLowStockIngredients(req, res) {
        try {
            const { threshold = 10 } = req.query;
            const ingredients = await this.ingredientModel.findLowStock(parseInt(threshold));

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    ingredients,
                    total: ingredients.length,
                    threshold: parseInt(threshold)
                }
            });

        } catch (error) {
            console.error('Get low stock ingredients error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy nguyên liệu tồn kho thấp',
                error: error.message
            });
        }
    }

    // Lấy nguyên liệu sắp hết hạn
    async getExpiringIngredients(req, res) {
        try {
            const { days = 7 } = req.query;
            const ingredients = await this.ingredientModel.findExpiringSoon(parseInt(days));

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    ingredients,
                    total: ingredients.length,
                    days: parseInt(days)
                }
            });

        } catch (error) {
            console.error('Get expiring ingredients error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy nguyên liệu sắp hết hạn',
                error: error.message
            });
        }
    }

    // Lấy thống kê nguyên liệu
    async getIngredientStats(req, res) {
        try {
            const stats = await this.ingredientModel.getStatistics();

            this.sendResponse(res, 200, {
                success: true,
                data: { stats }
            });

        } catch (error) {
            console.error('Get ingredient stats error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thống kê nguyên liệu',
                error: error.message
            });
        }
    }
}

module.exports = IngredientController;
