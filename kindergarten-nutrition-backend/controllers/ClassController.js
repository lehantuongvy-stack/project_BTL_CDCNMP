/**
 * Class Controller
 * Xử lý các API requests cho classes
 */

const Class = require('../models/Class');
const BaseController = require('./BaseController');

class ClassController extends BaseController {
    constructor(db) {
        super();
        this.db = db;
        this.classModel = new Class(db);
    }

    // Lấy tất cả classes
    async getAllClasses(req, res) {
        try {
            console.log(' Getting all classes...');
            
            const classes = await this.classModel.findAll();
            
            console.log(' Found classes:', classes.length);
            
            this.sendResponse(res, 200, {
                success: true,
                message: 'Lấy danh sách lớp học thành công',
                data: classes
            });
        } catch (error) {
            console.error('ClassController.getAllClasses error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách lớp học',
                error: error.message
            });
        }
    }

    // Lấy class theo ID
    async getClassById(req, res) {
        try {
            const { id } = req.params;
            console.log(' Getting class by ID:', id);
            
            const classData = await this.classModel.findById(id);
            
            if (!classData) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy lớp học'
                });
            }
            
            this.sendResponse(res, 200, {
                success: true,
                message: 'Lấy thông tin lớp học thành công',
                data: classData
            });
        } catch (error) {
            console.error('ClassController.getClassById error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thông tin lớp học',
                error: error.message
            });
        }
    }

}

module.exports = ClassController;