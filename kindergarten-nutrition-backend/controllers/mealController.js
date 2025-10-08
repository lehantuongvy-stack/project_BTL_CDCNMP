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
     * Lấy danh sách thư viện món ăn
     * GET /api/foods
     */
    async getFoodLibrary(req, res) {
        try {
            const { loai_mon, do_tuoi, search } = req.query;

            let foodsData = await this.mealModel.getAllFoods();

            // Lọc theo loại món nếu có
            if (loai_mon) {
                foodsData.foods = foodsData.foods.filter(food => 
                    food.loai_mon === loai_mon
                );
            }

            // Lọc theo độ tuổi phù hợp nếu có
            if (do_tuoi) {
                foodsData.foods = foodsData.foods.filter(food => 
                    !food.do_tuoi_phu_hop || 
                    food.do_tuoi_phu_hop.includes(do_tuoi)
                );
            }

            // Tìm kiếm theo tên món nếu có
            if (search) {
                const searchLower = search.toLowerCase();
                foodsData.foods = foodsData.foods.filter(food => 
                    food.ten_mon_an.toLowerCase().includes(searchLower) ||
                    (food.mo_ta && food.mo_ta.toLowerCase().includes(searchLower))
                );
            }

            // Cập nhật tổng số sau khi lọc
            foodsData.total = foodsData.foods.length;

            this.sendResponse(res, 200, {
                success: true,
                data: foodsData,
                message: 'Lấy thư viện món ăn thành công'
            });

        } catch (error) {
            console.error('Error in getFoodLibrary:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi lấy thư viện món ăn: ' + error.message
            });
        }
    }

    /**
     * Lấy thực đơn theo tuần với format chuẩn cho frontend
     * GET /api/meals/week?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&nhom=nha_tre|mau_giao
     */
    async getWeeklyMealsForAPI(req, res) {
        try {
            let { start_date, end_date, nhom, class_id, date } = req.query;
            console.log(` getWeeklyMealsForAPI request params:`, req.query);
            console.log(` Security filter: { class_id: ${class_id}, nhom: ${nhom} }`);

            // Support both formats: date or start_date/end_date
            if (date && !start_date && !end_date) {
                // Calculate week start and end from single date
                const inputDate = new Date(date);
                const day = inputDate.getDay();
                const diff = inputDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
                const weekStart = new Date(inputDate.setDate(diff));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 4); // Friday
                
                start_date = weekStart.toISOString().split('T')[0];
                end_date = weekEnd.toISOString().split('T')[0];
            }

            // Validate required parameters
            if (!start_date || !end_date) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu tham số start_date và end_date (YYYY-MM-DD) hoặc date (YYYY-MM-DD)'
                });
            }

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD'
                });
            }

            // Validate nhom if provided
            if (nhom && !['nha_tre', 'mau_giao'].includes(nhom)) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'nhom phải là nha_tre hoặc mau_giao'
                });
            }

            // Validate date range
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            if (startDate > endDate) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
                });
            }

            const mealsData = await this.mealModel.getWeeklyMealsForAPI(start_date, end_date, nhom, class_id);

            this.sendResponse(res, 200, {
                success: true,
                data: mealsData,
                message: `Lấy thực đơn tuần thành công`
            });

        } catch (error) {
            console.error('Error in getWeeklyMealsForAPI:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi lấy thực đơn theo tuần: ' + error.message
            });
        }
    }

    /**
     * Lấy thực đơn theo ngày với format chuẩn cho API
     * GET /api/meals/date?date=YYYY-MM-DD&nhom=nha_tre|mau_giao
     */
    async getMealsByDateForAPI(req, res) {
        try {
            const { date, nhom, class_id } = req.query;
            console.log("📅 API gọi lấy thực đơn ngày:", date, "| nhóm:", nhom, "| lớp:", class_id);

            const menuData = await this.mealModel.getMealsByDateForAPI(date, nhom, class_id);

            // ✅ Nếu không có dữ liệu, vẫn trả 200 (frontend sẽ xử lý hiển thị 'Không có thực đơn')
            if (!menuData) {
                console.warn("⚠️ menuData là null hoặc undefined");
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: `Không có thực đơn cho ngày ${date}`
                });
            }

            if (Object.keys(menuData).length === 0) {
                console.warn("⚠️ menuData rỗng");
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: `Không có thực đơn cho ngày ${date}`
                });
            }

            // ✅ Nếu có dữ liệu
            console.log("✅ Trả dữ liệu thực đơn ngày:", date);
            return res.status(200).json({
                success: true,
                data: menuData,
                message: `Lấy thực đơn ngày ${date} thành công`
            });

        } catch (error) {
            console.error("❌ Lỗi getMealsByDateForAPI:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thực đơn theo ngày",
                error: error.message
            });
        }
    }

    /**
     * Lấy thực đơn cho slide-right-home component
     * GET /api/meals/slide-right-home?date=YYYY-MM-DD
     */
    async getSlideRightHomeMeals(req, res) {
        try {
            // Lấy ngày từ query, nếu không có thì dùng ngày hiện tại
            const { date } = req.query;
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            console.log("🏠 API slide-right-home gọi lấy thực đơn ngày:", targetDate);

            const menuData = await this.mealModel.getMealsByDateForAPI(targetDate);

            // ✅ Nếu không có dữ liệu, vẫn trả 200 (frontend sẽ xử lý hiển thị 'Không có thực đơn')
            if (!menuData) {
                console.warn("⚠️ slide-right-home: menuData là null hoặc undefined");
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: `Không có thực đơn cho ngày ${targetDate}`
                });
            }

            if (Object.keys(menuData).length === 0) {
                console.warn("⚠️ slide-right-home: menuData rỗng");
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: `Không có thực đơn cho ngày ${targetDate}`
                });
            }

            // ✅ Nếu có dữ liệu
            console.log("✅ slide-right-home: Trả dữ liệu thực đơn ngày:", targetDate);
            return res.status(200).json({
                success: true,
                data: menuData,
                message: `Lấy thực đơn ngày ${targetDate} thành công`
            });

        } catch (error) {
            console.error("❌ Lỗi getSlideRightHomeMeals:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thực đơn cho slide-right-home",
                error: error.message
            });
        }
    }

    /**
     * Lấy danh sách món ăn cho dropdown
     * GET /api/meals/mon-an
     */
    async getFoodsForDropdown(req, res) {
        try {
            const foods = await this.mealModel.getFoodsForDropdown();

            this.sendResponse(res, 200, {
                success: true,
                data: foods,
                message: 'Lấy danh sách món ăn thành công'
            });

        } catch (error) {
            console.error('Error in getFoodsForDropdown:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi lấy danh sách món ăn: ' + error.message
            });
        }
    }

    /**
     * Cập nhật thực đơn (cho giáo viên)
     * PUT /api/meals/:id
     */
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
     * Cập nhật thực đơn theo format mới (không cần mealId)
     * PUT /api/meals/update
     */
    async updateMealPlanNew(req, res) {
        try {
            console.log('🔄 updateMealPlanNew called');
            console.log('📊 Request body:', req.body);

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

            const { ngay_ap_dung, nhom, class_id, chi_tiet } = updateData;

            // Validate required fields - Cho phép 2 formats:
            // Format 1: {ngay_ap_dung, nhom, chi_tiet} - áp dụng theo nhóm lớp
            // Format 2: {ngay_ap_dung, class_id, chi_tiet} - áp dụng theo lớp cụ thể
            if (!ngay_ap_dung || !chi_tiet) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: ngay_ap_dung, chi_tiet'
                });
            }

            if (!nhom && !class_id) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Phải có nhom (nha_tre/mau_giao) hoặc class_id'
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
            console.error('Error in updateMealPlanNew:', error);
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
