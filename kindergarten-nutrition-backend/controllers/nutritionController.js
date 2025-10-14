/**
 * Nutrition Controller logic cho quản lý hồ sơ dinh dưỡng
 */

const BaseController = require('./BaseController');
const NutritionRecord = require('../models/NutritionRecord');

class NutritionController extends BaseController {
    constructor(db) {
        super();
        this.db = db;
        this.nutritionModel = new NutritionRecord(db);
    }

    /**
     * Tạo hồ sơ đánh giá dinh dưỡng mới (Quản lý)
     */
    async createNutritionRecord(recordData) {
        try {
            
            // Validation cơ bản
            const dateField = recordData.ngay_danh_gia || recordData.ngay_ghi_nhan;
            console.log(' Validation check:', {
                child_id: recordData.child_id,
                dateField: dateField,
                ngay_danh_gia: recordData.ngay_danh_gia,
                ngay_ghi_nhan: recordData.ngay_ghi_nhan
            });
            
            if (!recordData.child_id || !dateField) {
                console.log('Validation failed: Missing required fields');
                throw new Error('Thiếu thông tin bắt buộc: child_id, ngay_danh_gia');
            }

            if (!recordData.ngay_danh_gia && recordData.ngay_ghi_nhan) {
                recordData.ngay_danh_gia = recordData.ngay_ghi_nhan;
            }

            if (!recordData.chieu_cao || !recordData.can_nang) {
                throw new Error('Thiếu thông tin chiều cao và cân nặng');
            }

            if (recordData.chieu_cao < 50 || recordData.chieu_cao > 200) {
                throw new Error('Chiều cao không hợp lý (50-200cm)');
            }

            if (recordData.can_nang < 5 || recordData.can_nang > 100) {
                throw new Error('Cân nặng không hợp lý (5-100kg)');
            }

            const existingRecord = await this.checkExistingRecord(
                recordData.child_id, 
                recordData.ngay_danh_gia || recordData.ngay_ghi_nhan  
            );

            const childInfo = await this.getChildAge(recordData.child_id);
            if (childInfo) {
                recordData.age = childInfo.age_months;
            }

            // Kiểm tra tồn tại để cập nhật thay vì tạo mới
            let record;
            if (existingRecord) {
                console.log(' Updating existing record:', existingRecord.id);
                const allowedFields = {
                    child_id: recordData.child_id,
                    teacher_id: recordData.teacher_id,
                    ngay_danh_gia: recordData.ngay_danh_gia,
                    chieu_cao: recordData.chieu_cao,
                    can_nang: recordData.can_nang,
                    tinh_trang_suc_khoe: recordData.tinh_trang_suc_khoe,
                    ket_luan: recordData.ket_luan,
                    khuyen_cao: recordData.khuyen_cao,
                    an_uong: recordData.an_uong,
                    hoat_dong: recordData.hoat_dong,
                    tinh_than: recordData.tinh_than
                };
                
                record = await this.nutritionModel.update(existingRecord.id, allowedFields);
            } else {
                console.log(' Creating new record');
                record = await this.nutritionModel.create(recordData);
            }
            
            return record;

        } catch (error) {
            console.error('Error in createNutritionRecord:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra hồ sơ đã tồn tại trong ngày
     */
    async checkExistingRecord(childId, date) {
        try {
            const query = 'SELECT id FROM danh_gia_suc_khoe WHERE child_id = ? AND DATE(ngay_danh_gia) = DATE(?)';
            const result = await this.db.query(query, [childId, date]);
            return result.length > 0 ? result[0] : null;

        } catch (error) {
            console.error('Error checking existing record:', error);
            throw error;
        }
    }

    /**
     * Lấy tuổi của trẻ
     */
    async getChildAge(childId) {
        try {
            const query = `
                SELECT 
                    TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) as age_months,
                    TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age_years
                FROM children 
                WHERE id = ?
            `;
            const result = await this.db.query(query, [childId]);
            return result.length > 0 ? result[0] : null;

        } catch (error) {
            console.error('Error getting child age:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách hồ sơ dinh dưỡng
     */
    async getNutritionRecords(filters = {}) {
        try {
            return await this.nutritionModel.findAll(filters);

        } catch (error) {
            console.error('Error in getNutritionRecords:', error);
            throw error;
        }
    }

    /**
     * Lấy hồ sơ dinh dưỡng theo ID
     */
    async getNutritionRecordById(id) {
        try {
            return await this.nutritionModel.findById(id);

        } catch (error) {
            console.error('Error in getNutritionRecordById:', error);
            throw error;
        }
    }

    /**
     * Cập nhật hồ sơ dinh dưỡng
     */
    async updateNutritionRecord(id, updateData) {
        try {
            // Validation
            if (updateData.chieu_cao && (updateData.chieu_cao < 50 || updateData.chieu_cao > 200)) {
                throw new Error('Chiều cao không hợp lý (50-200cm)');
            }

            if (updateData.can_nang && (updateData.can_nang < 5 || updateData.can_nang > 100)) {
                throw new Error('Cân nặng không hợp lý (5-100kg)');
            }

            // Kiểm tra xem hồ sơ có tồn tại không
            const existingRecord = await this.nutritionModel.findById(id);
            if (!existingRecord) {
                throw new Error('Không tìm thấy hồ sơ dinh dưỡng để cập nhật');
            }

            return await this.nutritionModel.update(id, updateData);

        } catch (error) {
            console.error('Error in updateNutritionRecord:', error);
            throw error;
        }
    }

    /**
     * Xóa hồ sơ dinh dưỡng
     */
    async deleteNutritionRecord(id) {
        try {
            // Kiểm tra xem hồ sơ có tồn tại không
            const existingRecord = await this.nutritionModel.findById(id);
            if (!existingRecord) {
                throw new Error('Không tìm thấy hồ sơ dinh dưỡng để xóa');
            }

            return await this.nutritionModel.delete(id);

        } catch (error) {
            console.error('Error in deleteNutritionRecord:', error);
            throw error;
        }
    }

    /**
     * Lấy hồ sơ dinh dưỡng của trẻ
     */
    async getChildNutritionRecords(childId, limit = 10) {
        try {
            return await this.nutritionModel.findByChildId(childId, limit);

        } catch (error) {
            console.error('Error in getChildNutritionRecords:', error);
            throw error;
        }
    }


    /**
     * Tính BMI và đánh giá
     */
    async calculateBMI(weight, height, age = null) {
        try {
            const bmi = this.nutritionModel.calculateBMI(weight, height);
            const status = this.nutritionModel.assessNutritionStatus(bmi, age);

            return {
                weight,
                height,
                age,
                bmi,
                nutrition_status: status,
                recommendations: this.getNutritionRecommendations(status, bmi, age)
            };

        } catch (error) {
            console.error('Error in calculateBMI:', error);
            throw error;
        }
    }

}

module.exports = NutritionController;