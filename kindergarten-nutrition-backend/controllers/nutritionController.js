/**
 * Nutrition Controller - Business logic cho quản lý hồ sơ dinh dưỡng
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
     * Tạo hồ sơ dinh dưỡng mới
     */
    async createNutritionRecord(recordData) {
        try {
            // Validation - hỗ trợ cả 2 tên field
            const dateField = recordData.ngay_danh_gia || recordData.ngay_ghi_nhan;
            if (!recordData.child_id || !dateField) {
                throw new Error('Thiếu thông tin bắt buộc: child_id, ngay_danh_gia');
            }

            // Đảm bảo có field ngày đánh giá
            if (!recordData.ngay_danh_gia && recordData.ngay_ghi_nhan) {
                recordData.ngay_danh_gia = recordData.ngay_ghi_nhan;
            }

            if (!recordData.chieu_cao || !recordData.can_nang) {
                throw new Error('Thiếu thông tin chiều cao và cân nặng');
            }

            // Validate giá trị hợp lý
            if (recordData.chieu_cao < 50 || recordData.chieu_cao > 200) {
                throw new Error('Chiều cao không hợp lý (50-200cm)');
            }

            if (recordData.can_nang < 5 || recordData.can_nang > 100) {
                throw new Error('Cân nặng không hợp lý (5-100kg)');
            }

            // Kiểm tra xem đã có hồ sơ trong ngày chưa
            const existingRecord = await this.checkExistingRecord(
                recordData.child_id, 
                recordData.ngay_danh_gia || recordData.ngay_ghi_nhan  // Hỗ trợ cả 2 tên field
            );

            if (existingRecord) {
                throw new Error('Đã có hồ sơ dinh dưỡng cho ngày này');
            }

            // Lấy thông tin tuổi của trẻ
            const childInfo = await this.getChildAge(recordData.child_id);
            if (childInfo) {
                recordData.age = childInfo.age_months;
            }

            const record = await this.nutritionModel.create(recordData);
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
     * Lấy hồ sơ dinh dưỡng mới nhất
     */
    async getLatestNutritionRecord(childId) {
        try {
            return await this.nutritionModel.getLatestRecord(childId);

        } catch (error) {
            console.error('Error in getLatestNutritionRecord:', error);
            throw error;
        }
    }

    /**
     * Lấy biểu đồ tăng trưởng
     */
    async getGrowthChart(childId, months = 12) {
        try {
            return await this.nutritionModel.getGrowthChart(childId, months);

        } catch (error) {
            console.error('Error in getGrowthChart:', error);
            throw error;
        }
    }

    /**
     * Thống kê dinh dưỡng theo lớp
     */
    async getClassNutritionStats(classId) {
        try {
            return await this.nutritionModel.getClassNutritionStats(classId);

        } catch (error) {
            console.error('Error in getClassNutritionStats:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách trẻ cần quan tâm đặc biệt
     */
    async getChildrenNeedAttention() {
        try {
            return await this.nutritionModel.findChildrenNeedAttention();

        } catch (error) {
            console.error('Error in getChildrenNeedAttention:', error);
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

    /**
     * Lấy khuyến nghị dinh dưỡng
     */
    getNutritionRecommendations(status, bmi, age) {
        const recommendations = [];

        switch (status) {
            case 'suy_dinh_duong_nang':
                recommendations.push('Cần tăng cường dinh dưỡng khẩn cấp');
                recommendations.push('Tham khảo ý kiến bác sĩ chuyên khoa');
                recommendations.push('Bổ sung protein và vitamin');
                break;

            case 'suy_dinh_duong':
                recommendations.push('Cần cải thiện chế độ ăn uống');
                recommendations.push('Tăng cường thực phẩm giàu protein');
                recommendations.push('Theo dõi cân nặng định kỳ');
                break;

            case 'binh_thuong':
                recommendations.push('Duy trì chế độ ăn cân bằng');
                recommendations.push('Tăng cường hoạt động thể chất');
                recommendations.push('Theo dõi tăng trưởng định kỳ');
                break;

            case 'thua_can':
                recommendations.push('Kiểm soát lượng calo nạp vào');
                recommendations.push('Tăng cường hoạt động vận động');
                recommendations.push('Hạn chế đồ ngọt và đồ chiên');
                break;

            case 'beo_phi':
                recommendations.push('Cần can thiệp giảm cân');
                recommendations.push('Tham khảo chuyên gia dinh dưỡng');
                recommendations.push('Lập kế hoạch ăn uống và vận động');
                break;

            default:
                recommendations.push('Cần đánh giá thêm từ chuyên gia');
        }

        return recommendations;
    }

    /**
     * Tổng quan thống kê dinh dưỡng
     */
    async getNutritionOverview(filters = {}) {
        try {
            // Thống kê tổng quan
            const overallStats = await this.db.query(`
                SELECT 
                    COUNT(*) as total_records,
                    COUNT(DISTINCT child_id) as total_children,
                    AVG(bmi) as avg_bmi,
                    AVG(chieu_cao) as avg_height,
                    AVG(can_nang) as avg_weight
                FROM ho_so_dinh_duong
                WHERE ngay_ghi_nhan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            `);

            // Thống kê theo tình trạng dinh dưỡng
            const statusStats = await this.db.query(`
                SELECT 
                    tinh_trang_dinh_duong,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ho_so_dinh_duong WHERE ngay_ghi_nhan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)), 2) as percentage
                FROM ho_so_dinh_duong
                WHERE ngay_ghi_nhan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY tinh_trang_dinh_duong
                ORDER BY count DESC
            `);

            // Xu hướng theo tháng
            const monthlyTrend = await this.db.query(`
                SELECT 
                    DATE_FORMAT(ngay_ghi_nhan, '%Y-%m') as month,
                    COUNT(*) as record_count,
                    AVG(bmi) as avg_bmi,
                    COUNT(CASE WHEN tinh_trang_dinh_duong IN ('suy_dinh_duong', 'suy_dinh_duong_nang') THEN 1 END) as malnourished_count,
                    COUNT(CASE WHEN tinh_trang_dinh_duong IN ('thua_can', 'beo_phi') THEN 1 END) as overweight_count
                FROM ho_so_dinh_duong
                WHERE ngay_ghi_nhan >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(ngay_ghi_nhan, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            `);

            // Thống kê theo lớp
            const classStats = await this.db.query(`
                SELECT 
                    lh.ten_lop,
                    COUNT(DISTINCT hsdd.child_id) as children_count,
                    AVG(hsdd.bmi) as avg_bmi,
                    COUNT(CASE WHEN hsdd.tinh_trang_dinh_duong = 'binh_thuong' THEN 1 END) as normal_count,
                    COUNT(CASE WHEN hsdd.tinh_trang_dinh_duong IN ('suy_dinh_duong', 'suy_dinh_duong_nang') THEN 1 END) as malnourished_count
                FROM ho_so_dinh_duong hsdd
                JOIN children c ON hsdd.child_id = c.id
                JOIN lop_hoc lh ON c.lop_hoc_id = lh.id
                WHERE hsdd.ngay_ghi_nhan = (
                    SELECT MAX(ngay_ghi_nhan) 
                    FROM ho_so_dinh_duong hsdd2 
                    WHERE hsdd2.child_id = hsdd.child_id
                )
                GROUP BY lh.id, lh.ten_lop
                ORDER BY lh.ten_lop
            `);

            return {
                overall: overallStats[0] || {},
                status_distribution: statusStats,
                monthly_trend: monthlyTrend,
                class_stats: classStats,
                generated_at: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error in getNutritionOverview:', error);
            throw error;
        }
    }

    /**
     * Đánh giá rủi ro dinh dưỡng
     */
    async assessNutritionRisk(childId) {
        try {
            // Lấy lịch sử dinh dưỡng
            const records = await this.nutritionModel.findByChildId(childId, 6);
            
            if (records.length < 2) {
                return {
                    risk_level: 'insufficient_data',
                    message: 'Cần thêm dữ liệu để đánh giá'
                };
            }

            const latest = records[0];
            const previous = records[1];

            // Tính toán các chỉ số rủi ro
            const riskFactors = [];

            // Rủi ro BMI
            if (latest.bmi < 14) {
                riskFactors.push('bmi_very_low');
            } else if (latest.bmi > 25) {
                riskFactors.push('bmi_very_high');
            }

            // Rủi ro xu hướng giảm cân
            const weightChange = latest.can_nang - previous.can_nang;
            if (weightChange < -2) {
                riskFactors.push('rapid_weight_loss');
            }

            // Rủi ro dị ứng
            if (latest.di_ung_thuc_pham && latest.di_ung_thuc_pham.trim() !== '') {
                riskFactors.push('food_allergies');
            }

            // Rủi ro bệnh lý
            if (latest.benh_ly_lien_quan && latest.benh_ly_lien_quan.trim() !== '') {
                riskFactors.push('medical_conditions');
            }

            // Xác định mức độ rủi ro
            let riskLevel = 'low';
            if (riskFactors.length >= 3) {
                riskLevel = 'high';
            } else if (riskFactors.length >= 1) {
                riskLevel = 'medium';
            }

            return {
                child_id: childId,
                risk_level: riskLevel,
                risk_factors: riskFactors,
                latest_record: latest,
                recommendations: this.getRiskRecommendations(riskLevel, riskFactors)
            };

        } catch (error) {
            console.error('Error in assessNutritionRisk:', error);
            throw error;
        }
    }

    /**
     * Lấy khuyến nghị dựa trên rủi ro
     */
    getRiskRecommendations(riskLevel, riskFactors) {
        const recommendations = [];

        if (riskLevel === 'high') {
            recommendations.push('Cần theo dõi sát sao và tham khảo bác sĩ');
            recommendations.push('Lập kế hoạch dinh dưỡng đặc biệt');
        }

        if (riskFactors.includes('bmi_very_low')) {
            recommendations.push('Bổ sung dinh dưỡng tăng cân');
        }

        if (riskFactors.includes('bmi_very_high')) {
            recommendations.push('Kiểm soát cân nặng và tăng vận động');
        }

        if (riskFactors.includes('food_allergies')) {
            recommendations.push('Lưu ý đặc biệt về thực đơn và dị ứng');
        }

        if (riskFactors.includes('rapid_weight_loss')) {
            recommendations.push('Tìm hiểu nguyên nhân giảm cân và can thiệp kịp thời');
        }

        if (recommendations.length === 0) {
            recommendations.push('Tiếp tục theo dõi và duy trì chế độ ăn cân bằng');
        }

        return recommendations;
    }

    /**
     * Lấy thống kê dinh dưỡng theo child_id
     */
    async getChildNutritionStats(childId, query = {}) {
        try {
            // Kiểm tra trẻ em có tồn tại không
            const childQuery = 'SELECT * FROM children WHERE id = ?';
            const childResult = await this.db.query(childQuery, [childId]);
            
            console.log('🔍 Child query result:', childResult);
            
            // Database trả về array, lấy phần tử đầu tiên
            const child = Array.isArray(childResult) ? childResult[0] : childResult;
            console.log('👶 Child found:', child);
            
            if (!child || !child.id) {
                throw new Error('Không tìm thấy thông tin trẻ em');
            }

            // Lấy tất cả hồ sơ dinh dưỡng của trẻ
            const recordsQuery = `
                SELECT * FROM danh_gia_suc_khoe 
                WHERE child_id = ? 
                ORDER BY ngay_danh_gia DESC
            `;
            const recordsResult = await this.db.query(recordsQuery, [childId]);
            const records = Array.isArray(recordsResult) ? recordsResult : [recordsResult].filter(r => r);

            // Tính toán thống kê
            const stats = {
                child_info: {
                    id: child.id,
                    full_name: child.full_name,
                    date_of_birth: child.date_of_birth,
                    age_months: this.getChildAge(child.date_of_birth),
                    gender: child.gender
                },
                nutrition_summary: {
                    total_records: records.length,
                    latest_assessment: records.length > 0 ? records[0].ngay_danh_gia : null
                },
                detailed_records: records.slice(0, 10) // Chỉ lấy 10 record gần nhất
            };

            // Nếu có ít nhất 2 records, tính growth trend
            if (records.length >= 2) {
                const latest = records[0];
                const previous = records[1];

                stats.nutrition_summary.growth_trend = {
                    height: {
                        current: latest.chieu_cao,
                        previous: previous.chieu_cao,
                        change: `${(latest.chieu_cao - previous.chieu_cao).toFixed(1)} cm`
                    },
                    weight: {
                        current: latest.can_nang,
                        previous: previous.can_nang,
                        change: `${(latest.can_nang - previous.can_nang).toFixed(1)} kg`
                    }
                };

                stats.nutrition_summary.health_status = {
                    current: latest.tinh_trang_suc_khoe,
                    trend: this.compareHealthStatus(previous.tinh_trang_suc_khoe, latest.tinh_trang_suc_khoe)
                };
            }

            // Thêm recommendations nếu có dữ liệu
            if (records.length > 0) {
                // TODO: Implement generateNutritionRecommendations method
                // stats.recommendations = await this.generateNutritionRecommendations(childId);
                stats.recommendations = [
                    'Duy trì chế độ dinh dưỡng hiện tại',
                    'Tăng cường thể dục thể thao',
                    'Theo dõi sự phát triển đều đặn'
                ];
            }

            return stats;

        } catch (error) {
            console.error('Error getting child nutrition stats:', error);
            throw error;
        }
    }

    /**
     * So sánh tình trạng sức khỏe
     */
    compareHealthStatus(previous, current) {
        const statusLevel = {
            'Kém': 1,
            'Yếu': 2,
            'Bình thường': 3,
            'Tốt': 4,
            'Rất tốt': 5
        };

        const prevLevel = statusLevel[previous] || 3;
        const currLevel = statusLevel[current] || 3;

        if (currLevel > prevLevel) return 'Cải thiện';
        if (currLevel < prevLevel) return 'Giảm sút';
        return 'Ổn định';
    }
}

module.exports = NutritionController;
