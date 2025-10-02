/**
 * Nutrition Routes - API endpoints cho quản lý hồ sơ dinh dưỡng
 */

const url = require('url');

class NutritionRoutes {
    constructor(nutritionController, authController) {
        this.nutritionController = nutritionController;
        this.authController = authController;
    }

    /**
     * Route chính cho /api/nutrition
     */
    async handleNutritionRoutes(req, res) {
        try {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const method = req.method;
            const query = parsedUrl.query;

            // Xử lý các routes cụ thể
            if (pathname === '/api/nutrition/records' && method === 'GET') {
                return await this.getNutritionRecords(req, res, query);
            }

            if (pathname === '/api/nutrition/records' && method === 'POST') {
                return await this.createNutritionRecord(req, res);
            }

            if (pathname.match(/^\/api\/nutrition\/records\/\d+$/) && method === 'GET') {
                const id = pathname.split('/').pop();
                return await this.getNutritionRecordById(req, res, id);
            }

            if (pathname.match(/^\/api\/nutrition\/records\/\d+$/) && method === 'PUT') {
                const id = pathname.split('/').pop();
                return await this.updateNutritionRecord(req, res, id);
            }

            if (pathname.match(/^\/api\/nutrition\/records\/\d+$/) && method === 'DELETE') {
                const id = pathname.split('/').pop();
                return await this.deleteNutritionRecord(req, res, id);
            }

            // Routes đặc biệt cho child
            if (pathname.match(/^\/api\/nutrition\/child\/\d+\/records$/) && method === 'GET') {
                const childId = pathname.split('/')[4];
                return await this.getChildNutritionRecords(req, res, childId, query);
            }

            if (pathname.match(/^\/api\/nutrition\/child\/\d+\/latest$/) && method === 'GET') {
                const childId = pathname.split('/')[4];
                return await this.getLatestNutritionRecord(req, res, childId);
            }

            if (pathname.match(/^\/api\/nutrition\/child\/\d+\/growth-chart$/) && method === 'GET') {
                const childId = pathname.split('/')[4];
                return await this.getGrowthChart(req, res, childId, query);
            }

            // Routes thống kê
            if (pathname === '/api/nutrition/stats/class' && method === 'GET') {
                return await this.getClassNutritionStats(req, res, query);
            }

            if (pathname === '/api/nutrition/stats/attention' && method === 'GET') {
                return await this.getChildrenNeedAttention(req, res);
            }

            if (pathname === '/api/nutrition/stats/overview' && method === 'GET') {
                return await this.getNutritionOverview(req, res, query);
            }

            // Thống kê dinh dưỡng theo child_id
            if (pathname.match(/^\/api\/nutrition\/stats\/[a-fA-F0-9-]+$/) && method === 'GET') {
                const childId = pathname.split('/').pop();
                return await this.getChildNutritionStats(req, res, childId, query);
            }

            // BMI Calculator
            if (pathname === '/api/nutrition/calculate-bmi' && method === 'POST') {
                return await this.calculateBMI(req, res);
            }

            // Parent routes - Lấy đánh giá sức khỏe của tất cả con theo parent
            if (pathname === '/api/nutrition/parent/records' && method === 'GET') {
                return await this.getParentChildrenRecords(req, res, query);
            }

            // Route không tìm thấy
            this.sendResponse(res, 404, {
                success: false,
                message: 'Nutrition API route not found'
            });

        } catch (error) {
            console.error('Nutrition routes error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server trong nutrition routes'
            });
        }
    }

    /**
     * GET /api/nutrition/records - Lấy danh sách hồ sơ dinh dưỡng
     */
    async getNutritionRecords(req, res, query) {
        try {
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const filters = {
                child_id: query.child_id,
                start_date: query.start_date,
                end_date: query.end_date,
                nutrition_status: query.nutrition_status,
                limit: query.limit,
                offset: query.offset
            };

            const records = await this.nutritionController.getNutritionRecords(filters);

            this.sendResponse(res, 200, {
                success: true,
                data: records,
                message: 'Lấy danh sách hồ sơ dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error getting nutrition records:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy danh sách hồ sơ dinh dưỡng'
            });
        }
    }

    /**
     * POST /api/nutrition/records - Tạo hồ sơ dinh dưỡng mới
     */
    async createNutritionRecord(req, res) {
        try {
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (!['admin', 'teacher', 'nutritionist'].includes(authResult.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền tạo hồ sơ dinh dưỡng'
                });
            }

            const body = await this.parseRequestBody(req);
            console.log('🔧 Received body data:', body);
            
            const recordData = {
                ...body,
                teacher_id: authResult.user.id  // Sử dụng teacher_id thay vì created_by
            };
            
            console.log('🔧 Final record data:', recordData);

            const record = await this.nutritionController.createNutritionRecord(recordData);

            this.sendResponse(res, 201, {
                success: true,
                data: record,
                message: 'Tạo hồ sơ dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error creating nutrition record:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi tạo hồ sơ dinh dưỡng'
            });
        }
    }

    /**
     * GET /api/nutrition/records/:id - Lấy hồ sơ dinh dưỡng theo ID
     */
    async getNutritionRecordById(req, res, id) {
        try {
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const record = await this.nutritionController.getNutritionRecordById(id);
            if (!record) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy hồ sơ dinh dưỡng'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                data: record,
                message: 'Lấy thông tin hồ sơ dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error getting nutrition record by ID:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy thông tin hồ sơ dinh dưỡng'
            });
        }
    }

    /**
     * PUT /api/nutrition/records/:id - Cập nhật hồ sơ dinh dưỡng
     */
    async updateNutritionRecord(req, res, id) {
        try {
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (!['admin', 'staff', 'doctor'].includes(authResult.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền cập nhật hồ sơ dinh dưỡng'
                });
            }

            const body = await this.parseRequestBody(req);
            const record = await this.nutritionController.updateNutritionRecord(id, body);

            this.sendResponse(res, 200, {
                success: true,
                data: record,
                message: 'Cập nhật hồ sơ dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error updating nutrition record:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi cập nhật hồ sơ dinh dưỡng'
            });
        }
    }

    /**
     * DELETE /api/nutrition/records/:id - Xóa hồ sơ dinh dưỡng
     */
    async deleteNutritionRecord(req, res, id) {
        try {
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (authResult.user.role !== 'admin') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ admin mới có quyền xóa hồ sơ dinh dưỡng'
                });
            }

            await this.nutritionController.deleteNutritionRecord(id);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Xóa hồ sơ dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error deleting nutrition record:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi xóa hồ sơ dinh dưỡng'
            });
        }
    }

    /**
     * GET /api/nutrition/child/:id/records - Lấy hồ sơ dinh dưỡng của trẻ
     */
    async getChildNutritionRecords(req, res, childId, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const limit = query.limit || 10;
            const records = await this.nutritionController.getChildNutritionRecords(childId, limit);

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    child_id: childId,
                    records
                },
                message: 'Lấy hồ sơ dinh dưỡng của trẻ thành công'
            });

        } catch (error) {
            console.error('Error getting child nutrition records:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy hồ sơ dinh dưỡng của trẻ'
            });
        }
    }

    /**
     * GET /api/nutrition/child/:id/latest - Lấy hồ sơ dinh dưỡng mới nhất
     */
    async getLatestNutritionRecord(req, res, childId) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const record = await this.nutritionController.getLatestNutritionRecord(childId);

            this.sendResponse(res, 200, {
                success: true,
                data: record,
                message: 'Lấy hồ sơ dinh dưỡng mới nhất thành công'
            });

        } catch (error) {
            console.error('Error getting latest nutrition record:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy hồ sơ dinh dưỡng mới nhất'
            });
        }
    }

    /**
     * GET /api/nutrition/child/:id/growth-chart - Lấy biểu đồ tăng trưởng
     */
    async getGrowthChart(req, res, childId, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const months = query.months || 12;
            const chart = await this.nutritionController.getGrowthChart(childId, months);

            this.sendResponse(res, 200, {
                success: true,
                data: chart,
                message: 'Lấy biểu đồ tăng trưởng thành công'
            });

        } catch (error) {
            console.error('Error getting growth chart:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy biểu đồ tăng trưởng'
            });
        }
    }

    /**
     * GET /api/nutrition/stats/class - Thống kê dinh dưỡng theo lớp
     */
    async getClassNutritionStats(req, res, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const classId = query.class_id;
            if (!classId) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Cần cung cấp class_id'
                });
            }

            const stats = await this.nutritionController.getClassNutritionStats(classId);

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    class_id: classId,
                    stats
                },
                message: 'Lấy thống kê dinh dưỡng theo lớp thành công'
            });

        } catch (error) {
            console.error('Error getting class nutrition stats:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy thống kê dinh dưỡng theo lớp'
            });
        }
    }

    /**
     * GET /api/nutrition/stats/attention - Trẻ cần quan tâm đặc biệt
     */
    async getChildrenNeedAttention(req, res) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            if (!['admin', 'staff', 'doctor'].includes(authResult.user.vai_tro)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền xem danh sách trẻ cần quan tâm'
                });
            }

            const children = await this.nutritionController.getChildrenNeedAttention();

            this.sendResponse(res, 200, {
                success: true,
                data: children,
                message: 'Lấy danh sách trẻ cần quan tâm thành công'
            });

        } catch (error) {
            console.error('Error getting children need attention:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy danh sách trẻ cần quan tâm'
            });
        }
    }

    /**
     * GET /api/nutrition/stats/overview - Tổng quan thống kê dinh dưỡng
     */
    async getNutritionOverview(req, res, query) {
        try {
            const authResult = await this.authController.verifyToken(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const overview = await this.nutritionController.getNutritionOverview(query);

            this.sendResponse(res, 200, {
                success: true,
                data: overview,
                message: 'Lấy tổng quan thống kê dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error getting nutrition overview:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy tổng quan thống kê dinh dưỡng'
            });
        }
    }

    /**
     * POST /api/nutrition/calculate-bmi - Tính BMI
     */
    async calculateBMI(req, res) {
        try {
            const body = await this.parseRequestBody(req);
            const { weight, height, age } = body;

            if (!weight || !height) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Cần cung cấp weight và height'
                });
            }

            const result = await this.nutritionController.calculateBMI(weight, height, age);

            this.sendResponse(res, 200, {
                success: true,
                data: result,
                message: 'Tính BMI thành công'
            });

        } catch (error) {
            console.error('Error calculating BMI:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi tính BMI'
            });
        }
    }

    /**
     * GET /api/nutrition/stats/{child_id} - Thống kê dinh dưỡng theo trẻ
     */
    async getChildNutritionStats(req, res, childId, query) {
        try {
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            const stats = await this.nutritionController.getChildNutritionStats(childId, query);

            this.sendResponse(res, 200, {
                success: true,
                data: stats,
                message: 'Lấy thống kê dinh dưỡng thành công'
            });

        } catch (error) {
            console.error('Error getting child nutrition stats:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi lấy thống kê dinh dưỡng'
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
     * GET /api/nutrition/parent/records - Lấy đánh giá sức khỏe của tất cả con theo parent
     */
    async getParentChildrenRecords(req, res, query) {
        try {
            const authResult = await this.authController.verifyTokenFromRequest(req);
            if (!authResult.success) {
                return this.sendResponse(res, 401, authResult);
            }

            // Chỉ parent mới có quyền truy cập route này
            if (authResult.user.role !== 'parent') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ phủ huynh mới có quyền xem thông tin này'
                });
            }

            const parentId = authResult.user.id;
            
            // Lấy danh sách tất cả con của parent này
            const childrenQuery = `
                SELECT id, full_name, date_of_birth, class_name 
                FROM children 
                WHERE parent_id = ? AND is_active = 1
                ORDER BY full_name
            `;
            
            const children = await this.nutritionController.db.query(childrenQuery, [parentId]);
            
            if (!children || children.length === 0) {
                return this.sendResponse(res, 200, {
                    success: true,
                    data: {
                        children: [],
                        message: 'Không tìm thấy con nào trong hệ thống'
                    }
                });
            }

            // Lấy đánh giá sức khỏe cho từng con
            const childrenWithRecords = await Promise.all(
                children.map(async (child) => {
                    const recordsQuery = `
                        SELECT dg.*, u.full_name as teacher_name
                        FROM danh_gia_suc_khoe dg
                        LEFT JOIN users u ON dg.teacher_id = u.id
                        WHERE dg.child_id = ?
                        ORDER BY dg.ngay_danh_gia DESC
                        LIMIT 10
                    `;
                    
                    const records = await this.nutritionController.db.query(recordsQuery, [child.id]);
                    
                    return {
                        child_info: {
                            id: child.id,
                            full_name: child.full_name,
                            date_of_birth: child.date_of_birth,
                            class_name: child.class_name
                        },
                        health_records: records || []
                    };
                })
            );

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    parent_id: parentId,
                    children: childrenWithRecords,
                    total_children: children.length
                }
            });

        } catch (error) {
            console.error('Error getting parent children records:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: error.message || 'Lỗi khi lấy thông tin đánh giá sức khỏe'
            });
        }
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

module.exports = NutritionRoutes;
