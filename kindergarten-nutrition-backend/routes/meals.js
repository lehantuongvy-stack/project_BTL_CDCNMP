/**
 * Meals Routes - API endpoints cho quản lý bữa ăn và thực đơn
 */

const url = require('url');

class MealsRoutes {
    constructor(mealController, authController) {
        this.mealController = mealController;
        this.authController = authController;
    }

    /**
     * Route chính cho /api/meals
     */
    async handleMealsRoutes(req, res) {
        try {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const method = req.method;
            const query = parsedUrl.query;

            // Xử lý các routes cụ thể
            if (pathname === '/api/meals' && method === 'GET') {
                return await this.getMeals(req, res, query);
            }

            if (pathname === '/api/meals' && method === 'POST') {
                return await this.createMeal(req, res);
            }

            if (pathname.match(/^\/api\/meals\/\d+$/) && method === 'GET') {
                const id = pathname.split('/').pop();
                return await this.getMealById(req, res, id);
            }

            if (pathname.match(/^\/api\/meals\/\d+$/) && method === 'PUT') {
                const id = pathname.split('/').pop();
                return await this.updateMeal(req, res, id);
            }

            if (pathname.match(/^\/api\/meals\/\d+$/) && method === 'DELETE') {
                const id = pathname.split('/').pop();
                return await this.deleteMeal(req, res, id);
            }

            // Routes đặc biệt
            if (pathname === '/api/meals/daily' && method === 'GET') {
                return await this.getDailyMeals(req, res, query);
            }

            if (pathname === '/api/meals/weekly' && method === 'GET') {
                return await this.getWeeklyMeals(req, res, query);
            }

            if (pathname === '/api/meals/weekly' && method === 'POST') {
                return await this.createWeeklyMenu(req, res);
            }

            if (pathname === '/api/meals/nutrition-summary' && method === 'GET') {
                return await this.getNutritionSummary(req, res, query);
            }

            if (pathname === '/api/meals/history' && method === 'GET') {
                return await this.getMealHistory(req, res, query);
            }

            // Route không tìm thấy
            this.sendResponse(res, 404, {
                success: false,
                message: 'Meals API route not found'
            });

        } catch (error) {
            console.error('Meals routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong meals routes'
            });
        }
    }

    /**
     * GET /api/meals - Lấy danh sách thực đơn
     */
    async getMeals(req, res, query) {
        try {
            // Kiểm tra quyền truy cập
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const filters = {
                date: query.date,
                class_id: query.class_id,
                session: query.session,
                limit: query.limit,
                offset: query.offset
            };

            let meals;
            if (filters.date) {
                // Lấy thực đơn theo ngày
                meals = await this.mealController.getMealsByDate(filters.date, filters.class_id);
            } else {
                // Lấy lịch sử thực đơn
                meals = await this.mealController.getMealHistory(filters);
            }

            this.sendResponse(res, 200, {
                success: true,
                data: meals,
                message: 'Lấy danh sách thực đơn thành công'
            });

        } catch (error) {
            console.error('Error getting meals:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy danh sách thực đơn'
            });
        }
    }

    /**
     * POST /api/meals - Tạo thực đơn mới
     */
    async createMeal(req, res) {
        try {
            // Kiểm tra quyền truy cập (chỉ admin và staff)
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (!['admin', 'staff'].includes(authResult.user.vai_tro)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền tạo thực đơn'
                });
            }

            const body = await this.parseRequestBody(req);
            const mealData = {
                ...body,
                created_by: authResult.user.id
            };

            const meal = await this.mealController.createMeal(mealData);

            this.sendResponse(res, 201, {
                success: true,
                data: meal,
                message: 'Tạo thực đơn thành công'
            });

        } catch (error) {
            console.error('Error creating meal:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi tạo thực đơn'
            });
        }
    }

    /**
     * GET /api/meals/:id - Lấy thông tin thực đơn theo ID
     */
    async getMealById(req, res, id) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const meal = await this.mealController.getMealById(id);
            if (!meal) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy thực đơn'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                data: meal,
                message: 'Lấy thông tin thực đơn thành công'
            });

        } catch (error) {
            console.error('Error getting meal by ID:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy thông tin thực đơn'
            });
        }
    }

    /**
     * PUT /api/meals/:id - Cập nhật thực đơn
     */
    async updateMeal(req, res, id) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (!['admin', 'staff'].includes(authResult.user.vai_tro)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền cập nhật thực đơn'
                });
            }

            const body = await this.parseRequestBody(req);
            const meal = await this.mealController.updateMeal(id, body);

            this.sendResponse(res, 200, {
                success: true,
                data: meal,
                message: 'Cập nhật thực đơn thành công'
            });

        } catch (error) {
            console.error('Error updating meal:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi cập nhật thực đơn'
            });
        }
    }

    /**
     * DELETE /api/meals/:id - Xóa thực đơn
     */
    async deleteMeal(req, res, id) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (authResult.user.vai_tro !== 'admin') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ admin mới có quyền xóa thực đơn'
                });
            }

            await this.mealController.deleteMeal(id);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Xóa thực đơn thành công'
            });

        } catch (error) {
            console.error('Error deleting meal:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi xóa thực đơn'
            });
        }
    }

    /**
     * GET /api/meals/daily - Lấy thực đơn trong ngày
     */
    async getDailyMeals(req, res, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const date = query.date || new Date().toISOString().split('T')[0];
            const classId = query.class_id;

            const meals = await this.mealController.getMealsByDate(date, classId);

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    date,
                    class_id: classId,
                    meals
                },
                message: 'Lấy thực đơn trong ngày thành công'
            });

        } catch (error) {
            console.error('Error getting daily meals:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy thực đơn trong ngày'
            });
        }
    }

    /**
     * GET /api/meals/weekly - Lấy thực đơn trong tuần
     */
    async getWeeklyMeals(req, res, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const startDate = query.start_date;
            const endDate = query.end_date;
            const classId = query.class_id;

            if (!startDate || !endDate) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Cần cung cấp start_date và end_date'
                });
            }

            const meals = await this.mealController.getWeeklyMeals(startDate, endDate, classId);

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    start_date: startDate,
                    end_date: endDate,
                    class_id: classId,
                    meals
                },
                message: 'Lấy thực đơn trong tuần thành công'
            });

        } catch (error) {
            console.error('Error getting weekly meals:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy thực đơn trong tuần'
            });
        }
    }

    /**
     * POST /api/meals/weekly - Tạo thực đơn cho cả tuần
     */
    async createWeeklyMenu(req, res) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (!['admin', 'staff'].includes(authResult.user.vai_tro)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền tạo thực đơn tuần'
                });
            }

            const body = await this.parseRequestBody(req);
            const weeklyMenuData = {
                ...body,
                created_by: authResult.user.id
            };

            const meals = await this.mealController.createWeeklyMenu(weeklyMenuData);

            this.sendResponse(res, 201, {
                success: true,
                data: meals,
                message: 'Tạo thực đơn tuần thành công'
            });

        } catch (error) {
            console.error('Error creating weekly menu:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi tạo thực đơn tuần'
            });
        }
    }

    /**
     * GET /api/meals/nutrition-summary - Lấy tóm tắt dinh dưỡng
     */
    async getNutritionSummary(req, res, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const date = query.date || new Date().toISOString().split('T')[0];
            const classId = query.class_id;

            const summary = await this.mealController.getNutritionSummary(date, classId);

            this.sendResponse(res, 200, {
                success: true,
                data: summary,
                message: 'Lấy tóm tắt dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error getting nutrition summary:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy tóm tắt dinh dưỡng'
            });
        }
    }

    /**
     * GET /api/meals/history - Lấy lịch sử thực đơn
     */
    async getMealHistory(req, res, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const filters = {
                start_date: query.start_date,
                end_date: query.end_date,
                class_id: query.class_id,
                limit: query.limit
            };

            const history = await this.mealController.getMealHistory(filters);

            this.sendResponse(res, 200, {
                success: true,
                data: history,
                message: 'Lấy lịch sử thực đơn thành công'
            });

        } catch (error) {
            console.error('Error getting meal history:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy lịch sử thực đơn'
            });
        }
    }

    /**
     * Parse request body
     */
    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });
        });
    }

    /**
     * Send response
     */
    sendResponse(res, statusCode, data) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(JSON.stringify(data));
    }
}

module.exports = MealsRoutes;
