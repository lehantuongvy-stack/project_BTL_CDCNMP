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
    * POST /api/meals
    */
    async createMeal(req, res) {
  try {
    // Validate quyền
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return this.sendResponse(res, 403, {
        success: false,
        message: 'Không có quyền tạo thực đơn'
      });
    }

    const menuData = {
      ...req.body,
      created_by: req.user.id
    };

    const result = await this.mealModel.createMenuWithDetails(menuData);
    
    this.sendResponse(res, 201, {
      success: true,
      data: result,
      message: 'Tạo thực đơn thành công'
    });

  } catch (error) {
    console.error('Create meal error:', error);
    this.sendResponse(res, 500, {
      success: false,
      message: 'Lỗi khi tạo thực đơn: ' + error.message
    });
  }
    }

    /**
    * Lấy danh sách thực đơn với pagination
    */
    async getMeals(req, res) {
    try {
            const { page = 1, limit = 50, date, class_id, session } = req.query;
            const offset = (page - 1) * limit;

            let meals;
            const filters = {};

            if (date) filters.date = date;
            if (class_id) filters.class_id = class_id;
            if (session) filters.session = session;

            if (Object.keys(filters).length > 0) {
                // Có filters - sử dụng findByDateAndClass hoặc findByWeek
                if (filters.date) {
                    meals = await this.mealModel.findByDateAndClass(filters.date, filters.class_id);
                } else {
                    meals = await this.mealModel.findAll(parseInt(limit), offset);
                }
            } else {
                // Không có filters - lấy tất cả
                meals = await this.mealModel.findAll(parseInt(limit), offset);
            }

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    meals: meals || [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: (meals && meals.length) || 0
                    }
                }
            });

        } catch (error) {
            console.error('Get meals error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách thực đơn',
                error: error.message
            });
        }
    }

    /**
     * Lấy chi tiết bữa ăn với thông tin đầy đủ
     * GET /api/meals/:id/details
     */
    async getMealDetails(req, res) {
        try {
            const pathParts = req.url.split('/').filter(Boolean);
            const mealId = pathParts[pathParts.length - 2]; // ID before 'details'

            if (!mealId) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu ID bữa ăn'
                });
            }

            const mealDetails = await this.mealModel.getMealDetails(mealId);

            if (!mealDetails) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy bữa ăn'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                data: mealDetails,
                message: 'Lấy chi tiết bữa ăn thành công'
            });

        } catch (error) {
            console.error('Error in getMealDetails:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi lấy chi tiết bữa ăn: ' + error.message
            });
        }
    }

    /**
     * Lấy thực đơn theo ngày 
     */
    async getMealsByDateForAPI(req, res) {
        try {
            const { date, nhom, class_id } = req.query;
            console.log(" API gọi lấy thực đơn ngày:", date, "| nhóm:", nhom, "| lớp:", class_id);

            const menuData = await this.mealModel.getMealsByDateForAPI(date, nhom, class_id);

            //  Nếu không có dữ liệu, vẫn trả 200 (frontend sẽ xử lý hiển thị 'Không có thực đơn')
            if (!menuData) {
                console.warn(" menuData là null hoặc undefined");
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: `Không có thực đơn cho ngày ${date}`
                });
            }

            if (Object.keys(menuData).length === 0) {
                console.warn(" menuData rỗng");
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: `Không có thực đơn cho ngày ${date}`
                });
            }

            //  Nếu có dữ liệu
            console.log(" Trả dữ liệu thực đơn ngày:", date);
            return res.status(200).json({
                success: true,
                data: menuData,
                message: `Lấy thực đơn ngày ${date} thành công`
            });

        } catch (error) {
            console.error(" Lỗi getMealsByDateForAPI:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thực đơn theo ngày",
                error: error.message
            });
        }
    }

    // /**
    //  * Cập nhật thực đơn (cho giáo viên)
    //  * PUT /api/meals/:id
    //  */
    async updateMealPlan(req, res) {
        try {
            const pathParts = req.url.split('/').filter(Boolean);
            const mealId = pathParts[pathParts.length - 1];
            
            if (!mealId) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu ID thực đơn'
                });
            }

            // Role check - chỉ giáo viên, admin, nutritionist mới được update
            if (!['admin', 'nutritionist', 'teacher'].includes(req.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền cập nhật thực đơn'
                });
            }

            // Validate request body
            const updateData = req.body;
            if (!updateData || Object.keys(updateData).length === 0) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Dữ liệu cập nhật không được để trống'
                });
            }

            const { ngay_ap_dung, nhom, chi_tiet } = updateData;

            // Validate required fields
            if (!ngay_ap_dung || !nhom || !chi_tiet) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: ngay_ap_dung, nhom, chi_tiet'
                });
            }

            // Validate chi_tiet array
            if (!Array.isArray(chi_tiet) || chi_tiet.length === 0) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'chi_tiet phải là mảng và không được rỗng'
                });
            }

            // Validate each chi_tiet item
            for (let i = 0; i < chi_tiet.length; i++) {
                const detail = chi_tiet[i];
                const { buoi, id_mon_an } = detail;

                if (!buoi || !id_mon_an) {
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: `Chi tiết thứ ${i + 1}: thiếu buoi hoặc id_mon_an`
                    });
                }

                // Validate buoi values
                if (!['sang', 'trua', 'xe'].includes(buoi)) {
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: `Chi tiết thứ ${i + 1}: buoi phải là sang, trua, hoặc xe`
                    });
                }
            }

            const result = await this.mealModel.updateMealPlanNew(updateData);

            this.sendResponse(res, 200, {
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Error in updateMealPlan:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi cập nhật thực đơn: ' + error.message
            });
        }
    }

    /**
     * Xóa thực đơn
     */
    async deleteMeal(req, res) {
        try {
            console.log(' req.params:', req.params);
            console.log(' req.pathParams:', req.pathParams);
            const menuId = (req.params && req.params.id) || (req.pathParams && req.pathParams.id);
            console.log(' Extracted menuId:', menuId);
            
            if (!menuId) {
                this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu ID thực đơn'
                });
                return;
            }

            const result = await this.mealModel.deleteMenuWithDetails(menuId);
            
            this.sendResponse(res, 200, {
                success: true,
                data: result,
                message: 'Xóa thực đơn thành công'
            });

        } catch (error) {
            console.error('Error in deleteMeal:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi xóa thực đơn: ' + error.message
            });
        }
    }
}

module.exports = MealController;
