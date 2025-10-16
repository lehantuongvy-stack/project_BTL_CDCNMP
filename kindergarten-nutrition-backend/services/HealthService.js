/**
 * Health Assessment Service - Quản lý đánh giá sức khỏe
 */

class HealthService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    // Tạo đánh giá sức khỏe mới
    async createHealthAssessment(data, user) {
        try {
            // Validate quyền
            if (!['admin', 'teacher'].includes(user.role)) {
                throw new Error('Không có quyền tạo đánh giá sức khỏe');
            }

            // Validate required fields
            if (!data.child_id) {
                throw new Error('ID trẻ em là bắt buộc');
            }

            // Validate child exists and user has permission
            const child = await this.db.query('SELECT * FROM children WHERE id = ?', [data.child_id]);
            if (!child.length) {
                throw new Error('Không tìm thấy thông tin trẻ em');
            }

            // Teachers can only assess children in their class
            if (user.role === 'teacher' && child[0].teacher_id !== user.id) {
                throw new Error('Bạn chỉ có thể đánh giá trẻ em trong lớp của mình');
            }

            // Tạo đánh giá sức khỏe
            const assessment = await this.db.createDanhGiaSucKhoe({
                child_id: data.child_id,
                teacher_id: user.id,
                chieu_cao: parseFloat(data.chieu_cao) || null,
                can_nang: parseFloat(data.can_nang) || null,
                tinh_trang_suc_khoe: data.tinh_trang_suc_khoe || null,
                khuyen_cao: data.khuyen_cao || null,
                an_uong: data.an_uong || 'good',
                hoat_dong: data.hoat_dong || 'normal',
                tinh_than: data.tinh_than || 'normal',
                lan_danh_gia_tiep_theo: data.lan_danh_gia_tiep_theo || null
            });

            // Cập nhật chiều cao và cân nặng trong bảng children nếu có
            if (data.chieu_cao || data.can_nang) {
                const updateSql = `
                    UPDATE children 
                    SET height = COALESCE(?, height), weight = COALESCE(?, weight)
                    WHERE id = ?
                `;
                await this.db.query(updateSql, [
                    parseFloat(data.chieu_cao) || null,
                    parseFloat(data.can_nang) || null,
                    data.child_id
                ]);
            }

            return {
                success: true,
                message: 'Tạo đánh giá sức khỏe thành công',
                data: assessment
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Lấy lịch sử đánh giá sức khỏe của trẻ
    async getChildHealthHistory(childId, user, limit = 10) {
        try {
            // Validate quyền xem
            if (user.role === 'parent') {
                // Parent chỉ xem được con mình
                const children = await this.db.getChildrenByParentId(user.id);
                const hasPermission = children.some(child => child.id === childId);
                if (!hasPermission) {
                    throw new Error('Bạn chỉ có thể xem đánh giá sức khỏe của con mình');
                }
            } else if (user.role === 'teacher') {
                // Teacher chỉ xem được trẻ trong lớp mình
                const child = await this.db.query('SELECT teacher_id FROM children WHERE id = ?', [childId]);
                if (!child.length || child[0].teacher_id !== user.id) {
                    throw new Error('Bạn chỉ có thể xem đánh giá của trẻ em trong lớp mình');
                }
            }

            const assessments = await this.db.getDanhGiaSucKhoeByChild(childId, limit);
            
            // Tính toán xu hướng tăng trưởng
            const growthTrend = this.calculateGrowthTrend(assessments);

            return {
                success: true,
                message: `Lịch sử đánh giá sức khỏe`,
                data: {
                    assessments: assessments,
                    growth_trend: growthTrend,
                    total_assessments: assessments.length
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Tính toán xu hướng tăng trưởng
    calculateGrowthTrend(assessments) {
        if (assessments.length < 2) {
            return {
                trend: 'insufficient_data',
                message: 'Cần ít nhất 2 lần đánh giá để tính xu hướng'
            };
        }

        const sortedAssessments = assessments.sort((a, b) => new Date(a.ngay_danh_gia) - new Date(b.ngay_danh_gia));
        const first = sortedAssessments[0];
        const last = sortedAssessments[sortedAssessments.length - 1];

        const heightChange = (last.chieu_cao || 0) - (first.chieu_cao || 0);
        const weightChange = (last.can_nang || 0) - (first.can_nang || 0);
        const timeSpan = Math.ceil((new Date(last.ngay_danh_gia) - new Date(first.ngay_danh_gia)) / (1000 * 60 * 60 * 24 * 30)); // months

        return {
            trend: 'calculated',
            time_span_months: timeSpan,
            height_change_cm: Math.round(heightChange * 10) / 10,
            weight_change_kg: Math.round(weightChange * 10) / 10,
            height_monthly_avg: timeSpan > 0 ? Math.round((heightChange / timeSpan) * 10) / 10 : 0,
            weight_monthly_avg: timeSpan > 0 ? Math.round((weightChange / timeSpan) * 10) / 10 : 0,
            bmi_current: last.bmi || null,
            bmi_previous: first.bmi || null
        };
    }

    // Phân tích BMI cho trẻ em
    analyzeBMI(height_cm, weight_kg, age_months, gender) {
        if (!height_cm || !weight_kg || height_cm <= 0 || weight_kg <= 0) {
            return {
                bmi: null,
                category: 'invalid_data',
                message: 'Dữ liệu chiều cao hoặc cân nặng không hợp lệ'
            };
        }

        const bmi = weight_kg / Math.pow(height_cm / 100, 2);
        
        // BMI categories for children (simplified)
        let category, message, recommendation;
        
        if (bmi < 14) {
            category = 'underweight';
            message = 'Dưới chuẩn';
            recommendation = 'Cần tăng cường dinh dưỡng và theo dõi sát sao';
        } else if (bmi < 18) {
            category = 'normal';
            message = 'Bình thường';
            recommendation = 'Duy trì chế độ ăn uống và vận động hiện tại';
        } else if (bmi < 20) {
            category = 'overweight';
            message = 'Thừa cân';
            recommendation = 'Điều chỉnh chế độ ăn và tăng hoạt động thể chất';
        } else {
            category = 'obese';
            message = 'Béo phì';
            recommendation = 'Cần can thiệp dinh dưỡng và luyện tập có hướng dẫn';
        }

        return {
            bmi: Math.round(bmi * 10) / 10,
            category: category,
            message: message,
            recommendation: recommendation
        };
    }

    // Tạo báo cáo sức khỏe theo lớp
    async getClassHealthReport(className, user) {
        try {
            // Validate quyền
            if (!['admin', 'teacher', 'nutritionist'].includes(user.role)) {
                throw new Error('Không có quyền xem báo cáo sức khỏe lớp học');
            }

            // Teachers chỉ xem được lớp mình dạy
            if (user.role === 'teacher') {
                const teacherClasses = await this.db.query(
                    'SELECT DISTINCT class_name FROM children WHERE teacher_id = ?', 
                    [user.id]
                );
                const hasPermission = teacherClasses.some(cls => cls.class_name === className);
                if (!hasPermission) {
                    throw new Error('Bạn chỉ có thể xem báo cáo của lớp mình dạy');
                }
            }

            // Lấy danh sách trẻ em trong lớp
            const children = await this.db.getAllChildren({ class_name: className });
            
            const classReport = {
                class_name: className,
                total_children: children.length,
                children_with_assessments: 0,
                avg_height: 0,
                avg_weight: 0,
                avg_bmi: 0,
                bmi_distribution: {
                    underweight: 0,
                    normal: 0,
                    overweight: 0,
                    obese: 0
                },
                health_issues: [],
                last_updated: new Date()
            };

            let totalHeight = 0, totalWeight = 0, totalBMI = 0;
            let childrenWithData = 0;

            for (const child of children) {
                // Lấy đánh giá mới nhất của từng trẻ
                const latestAssessment = await this.db.getDanhGiaSucKhoeByChild(child.id, 1);
                
                if (latestAssessment.length > 0) {
                    classReport.children_with_assessments++;
                    const assessment = latestAssessment[0];
                    
                    if (assessment.chieu_cao && assessment.can_nang) {
                        totalHeight += assessment.chieu_cao;
                        totalWeight += assessment.can_nang;
                        totalBMI += assessment.bmi || 0;
                        childrenWithData++;

                        // Phân loại BMI
                        const bmiAnalysis = this.analyzeBMI(
                            assessment.chieu_cao, 
                            assessment.can_nang, 
                            36, // Assume 3 years old
                            child.gender
                        );
                        
                        classReport.bmi_distribution[bmiAnalysis.category]++;

                        // Thu thập vấn đề sức khỏe
                        if (assessment.tinh_trang_suc_khoe && assessment.tinh_trang_suc_khoe.includes('bệnh')) {
                            classReport.health_issues.push({
                                child_name: child.full_name,
                                issue: assessment.tinh_trang_suc_khoe
                            });
                        }
                    }
                }
            }

            // Tính trung bình
            if (childrenWithData > 0) {
                classReport.avg_height = Math.round((totalHeight / childrenWithData) * 10) / 10;
                classReport.avg_weight = Math.round((totalWeight / childrenWithData) * 10) / 10;
                classReport.avg_bmi = Math.round((totalBMI / childrenWithData) * 10) / 10;
            }

            return {
                success: true,
                message: `Báo cáo sức khỏe lớp ${className}`,
                data: classReport
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Gợi ý can thiệp dinh dưỡng
    async suggestNutritionIntervention(childId, user) {
        try {
            // Lấy đánh giá mới nhất
            const assessments = await this.db.getDanhGiaSucKhoeByChild(childId, 3);
            if (!assessments.length) {
                return {
                    success: false,
                    message: 'Chưa có đánh giá sức khỏe nào cho trẻ này'
                };
            }

            const latest = assessments[0];
            const child = await this.db.query('SELECT * FROM children WHERE id = ?', [childId]);
            
            if (!child.length) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin trẻ em'
                };
            }

            const childInfo = child[0];
            const bmiAnalysis = this.analyzeBMI(latest.chieu_cao, latest.can_nang, 36, childInfo.gender);
            
            const suggestions = {
                nutrition_goals: [],
                dietary_recommendations: [],
                activity_suggestions: [],
                monitoring_frequency: 'monthly'
            };

            // Gợi ý dựa trên BMI
            switch (bmiAnalysis.category) {
                case 'underweight':
                    suggestions.nutrition_goals.push('Tăng cân 0.3-0.5kg/tháng');
                    suggestions.dietary_recommendations.push('Tăng calories 200-300 kcal/ngày');
                    suggestions.dietary_recommendations.push('Bổ sung protein chất lượng cao');
                    suggestions.dietary_recommendations.push('Thêm chất béo tốt (bơ, hạt)');
                    suggestions.monitoring_frequency = 'bi-weekly';
                    break;

                case 'overweight':
                    suggestions.nutrition_goals.push('Giảm cân từ từ 0.2-0.3kg/tháng');
                    suggestions.dietary_recommendations.push('Giảm calories 150-200 kcal/ngày');
                    suggestions.dietary_recommendations.push('Tăng rau xanh và trái cây');
                    suggestions.dietary_recommendations.push('Hạn chế đồ ngọt và thức ăn nhanh');
                    suggestions.activity_suggestions.push('Tăng hoạt động thể chất 30 phút/ngày');
                    break;

                case 'obese':
                    suggestions.nutrition_goals.push('Giảm cân 0.5-0.7kg/tháng');
                    suggestions.dietary_recommendations.push('Giảm calories 300-400 kcal/ngày');
                    suggestions.dietary_recommendations.push('Kiểm soát khẩu phần ăn');
                    suggestions.dietary_recommendations.push('Uống nhiều nước, hạn chế nước ngọt');
                    suggestions.activity_suggestions.push('Hoạt động thể chất 45-60 phút/ngày');
                    suggestions.monitoring_frequency = 'weekly';
                    break;

                default:
                    suggestions.nutrition_goals.push('Duy trì cân nặng hiện tại');
                    suggestions.dietary_recommendations.push('Duy trì chế độ ăn cân bằng');
                    suggestions.activity_suggestions.push('Hoạt động thể chất 30 phút/ngày');
            }

            // Gợi ý dựa trên tình trạng ăn uống
            if (latest.an_uong === 'poor') {
                suggestions.dietary_recommendations.push('Cải thiện sở thích ăn uống');
                suggestions.dietary_recommendations.push('Làm đa dạng món ăn');
                suggestions.dietary_recommendations.push('Tạo môi trường ăn uống tích cực');
            }

            // Xem xét dị ứng thực phẩm
            const allergies = JSON.parse(childInfo.allergies || '[]');
            if (allergies.length > 0) {
                suggestions.dietary_recommendations.push(`Tránh các thực phẩm dị ứng: ${allergies.join(', ')}`);
                suggestions.dietary_recommendations.push('Tìm thực phẩm thay thế có giá trị dinh dưỡng tương đương');
            }

            return {
                success: true,
                message: 'Gợi ý can thiệp dinh dưỡng',
                data: {
                    child_info: {
                        name: childInfo.full_name,
                        current_bmi: bmiAnalysis.bmi,
                        bmi_category: bmiAnalysis.category
                    },
                    suggestions: suggestions,
                    bmi_analysis: bmiAnalysis
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = HealthService;
