/**
 * Reporting Service
 * Tạo báo cáo tổng hợp và xuất file Excel, Word, PDF
 */

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

class ReportingService {
    constructor(db) {
        this.db = db;
        this.reportsDir = path.join(__dirname, '..', 'public', 'reports');
        this.ensureReportsDirectory();
    }

    async ensureReportsDirectory() {
        try {
            await fs.mkdir(this.reportsDir, { recursive: true });
        } catch (error) {
            console.error('Error creating reports directory:', error);
        }
    }

    // ================================================
    // BÁOÁO TỔ SỨC KHỎE TRẺ EM
    // ================================================

    async generateChildrenHealthReport(filters = {}) {
        try {
            const { class_name, start_date, end_date, format = 'json' } = filters;
            
            let sql = `
                SELECT 
                    c.student_id,
                    c.full_name,
                    c.class_name,
                    c.date_of_birth,
                    c.gender,
                    TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) as age_years,
                    
                    -- Latest health check
                    latest_health.ngay_danh_gia as latest_check_date,
                    latest_health.chieu_cao as height_cm,
                    latest_health.can_nang as weight_kg,
                    latest_health.bmi,
                    latest_health.tinh_trang_suc_khoe,
                    latest_health.an_uong,
                    latest_health.hoat_dong,
                    latest_health.tinh_than,
                    
                    -- BMI Classification
                    CASE 
                        WHEN latest_health.bmi < 18.5 THEN 'Thiếu cân'
                        WHEN latest_health.bmi BETWEEN 18.5 AND 24.9 THEN 'Bình thường'
                        WHEN latest_health.bmi BETWEEN 25 AND 29.9 THEN 'Thừa cân'
                        WHEN latest_health.bmi >= 30 THEN 'Béo phì'
                        ELSE 'Chưa đánh giá'
                    END as bmi_classification,
                    
                    -- Growth percentile (simplified)
                    CASE 
                        WHEN latest_health.chieu_cao > (SELECT AVG(chieu_cao) * 1.2 FROM danh_gia_suc_khoe dg2 JOIN children c2 ON dg2.child_id = c2.id WHERE TIMESTAMPDIFF(YEAR, c2.date_of_birth, CURDATE()) = TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE())) THEN 'Cao'
                        WHEN latest_health.chieu_cao < (SELECT AVG(chieu_cao) * 0.8 FROM danh_gia_suc_khoe dg2 JOIN children c2 ON dg2.child_id = c2.id WHERE TIMESTAMPDIFF(YEAR, c2.date_of_birth, CURDATE()) = TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE())) THEN 'Thấp'
                        ELSE 'Trung bình'
                    END as height_percentile,
                    
                    -- Teacher info
                    teacher.full_name as teacher_name,
                    
                    -- Parent info
                    parent.full_name as parent_name,
                    parent.phone as parent_phone,
                    
                    -- Health alerts
                    c.allergies,
                    c.medical_conditions,
                    
                    -- Total health checks count
                    health_count.total_checks
                    
                FROM children c
                LEFT JOIN users teacher ON c.teacher_id = teacher.id
                LEFT JOIN users parent ON c.parent_id = parent.id
                
                -- Get latest health check
                LEFT JOIN (
                    SELECT 
                        child_id,
                        ngay_danh_gia,
                        chieu_cao,
                        can_nang,
                        bmi,
                        tinh_trang_suc_khoe,
                        an_uong,
                        hoat_dong,
                        tinh_than,
                        ROW_NUMBER() OVER (PARTITION BY child_id ORDER BY ngay_danh_gia DESC) as rn
                    FROM danh_gia_suc_khoe
                ) latest_health ON c.id = latest_health.child_id AND latest_health.rn = 1
                
                -- Count total health checks
                LEFT JOIN (
                    SELECT child_id, COUNT(*) as total_checks
                    FROM danh_gia_suc_khoe
                    GROUP BY child_id
                ) health_count ON c.id = health_count.child_id
                
                WHERE c.is_active = true
            `;

            const params = [];
            
            if (class_name) {
                sql += ' AND c.class_name = ?';
                params.push(class_name);
            }
            
            if (start_date && end_date) {
                sql += ' AND latest_health.ngay_danh_gia BETWEEN ? AND ?';
                params.push(start_date, end_date);
            }
            
            sql += ' ORDER BY c.class_name, c.full_name';
            
            const children = await this.db.query(sql, params);
            
            // Calculate summary statistics
            const summary = this.calculateHealthSummary(children);
            
            const report = {
                title: 'Báo Cáo Tổng Hợp Sức Khỏe Trẻ Em',
                generated_at: new Date().toISOString(),
                filters: filters,
                summary: summary,
                data: children,
                total_children: children.length
            };

            return report;
            
        } catch (error) {
            console.error('Error generating children health report:', error);
            throw error;
        }
    }

    calculateHealthSummary(children) {
        const total = children.length;
        if (total === 0) return {};

        const bmiClassification = {
            'Thiếu cân': 0,
            'Bình thường': 0,
            'Thừa cân': 0,
            'Béo phì': 0,
            'Chưa đánh giá': 0
        };

        const heightClassification = {
            'Cao': 0,
            'Trung bình': 0,
            'Thấp': 0
        };

        let totalHeight = 0;
        let totalWeight = 0;
        let totalBMI = 0;
        let validHealthChecks = 0;

        children.forEach(child => {
            if (child.bmi_classification) {
                bmiClassification[child.bmi_classification]++;
            }
            if (child.height_percentile) {
                heightClassification[child.height_percentile]++;
            }
            if (child.height_cm && child.weight_kg && child.bmi) {
                totalHeight += parseFloat(child.height_cm) || 0;
                totalWeight += parseFloat(child.weight_kg) || 0;
                totalBMI += parseFloat(child.bmi) || 0;
                validHealthChecks++;
            }
        });

        return {
            total_children: total,
            valid_health_checks: validHealthChecks,
            average_height: validHealthChecks > 0 ? (totalHeight / validHealthChecks).toFixed(1) : 0,
            average_weight: validHealthChecks > 0 ? (totalWeight / validHealthChecks).toFixed(1) : 0,
            average_bmi: validHealthChecks > 0 ? (totalBMI / validHealthChecks).toFixed(1) : 0,
            bmi_distribution: bmiClassification,
            height_distribution: heightClassification,
            health_check_coverage: `${((validHealthChecks / total) * 100).toFixed(1)}%`
        };
    }

    // ================================================
    // BÁOÁO DINH DƯỠNG
    // ================================================

    async generateNutritionReport(filters = {}) {
        try {
            const { start_date, end_date, class_name } = filters;
            
            // Menu nutrition analysis
            const nutritionData = await this.db.query(`
                SELECT 
                    td.ten_thuc_don,
                    td.ngay_ap_dung,
                    td.loai_bua_an,
                    td.lop_ap_dung,
                    td.so_tre_du_kien,
                    
                    -- Nutrition totals from dishes
                    SUM(ma.total_calories * cttd.so_khau_phan) as total_calories,
                    SUM(ma.total_protein * cttd.so_khau_phan) as total_protein,
                    SUM(ma.total_fat * cttd.so_khau_phan) as total_fat,
                    SUM(ma.total_carbs * cttd.so_khau_phan) as total_carbs,
                    
                    -- Ingredient details
                    COUNT(DISTINCT ctma.nguyen_lieu_id) as unique_ingredients,
                    
                    -- Cost analysis
                    SUM(nl.gia_mua * ctma.so_luong * cttd.so_khau_phan) as estimated_cost,
                    
                    -- Creator info
                    creator.full_name as created_by_name,
                    
                    -- Average rating from parents
                    AVG(yk.danh_gia_sao) as avg_rating,
                    COUNT(yk.id) as feedback_count
                    
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don cttd ON td.id = cttd.thuc_don_id
                LEFT JOIN mon_an ma ON cttd.mon_an_id = ma.id
                LEFT JOIN chi_tiet_mon_an ctma ON ma.id = ctma.mon_an_id
                LEFT JOIN nguyen_lieu nl ON ctma.nguyen_lieu_id = nl.id
                LEFT JOIN users creator ON td.created_by = creator.id
                LEFT JOIN y_kien_phu_huynh yk ON td.id = yk.thuc_don_id
                
                WHERE td.trang_thai != 'draft'
                ${start_date && end_date ? 'AND td.ngay_ap_dung BETWEEN ? AND ?' : ''}
                ${class_name ? 'AND td.lop_ap_dung = ?' : ''}
                
                GROUP BY td.id
                ORDER BY td.ngay_ap_dung DESC
            `, [start_date, end_date, class_name].filter(Boolean));

            // Ingredient usage frequency
            const ingredientUsage = await this.db.query(`
                SELECT 
                    nl.ten_nguyen_lieu,
                    nl.category,
                    nl.don_vi_tinh,
                    COUNT(ctma.id) as usage_frequency,
                    SUM(ctma.so_luong) as total_quantity_used,
                    AVG(nl.calories_per_100g) as avg_calories_per_100g,
                    AVG(nl.protein_per_100g) as avg_protein_per_100g,
                    SUM(nl.gia_mua * ctma.so_luong) as total_cost
                FROM nguyen_lieu nl
                LEFT JOIN chi_tiet_mon_an ctma ON nl.id = ctma.nguyen_lieu_id
                LEFT JOIN mon_an ma ON ctma.mon_an_id = ma.id
                LEFT JOIN chi_tiet_thuc_don cttd ON ma.id = cttd.mon_an_id
                LEFT JOIN thuc_don td ON cttd.thuc_don_id = td.id
                WHERE td.ngay_ap_dung BETWEEN ? AND ?
                GROUP BY nl.id
                ORDER BY usage_frequency DESC
            `, [start_date || '2024-01-01', end_date || '2025-12-31']);

            const report = {
                title: 'Báo Cáo Dinh Dưỡng Tổng Hợp',
                generated_at: new Date().toISOString(),
                filters: filters,
                summary: {
                    total_menus: nutritionData.length,
                    avg_calories_per_meal: nutritionData.length > 0 ? 
                        (nutritionData.reduce((sum, item) => sum + (item.total_calories || 0), 0) / nutritionData.length).toFixed(0) : 0,
                    total_unique_ingredients: ingredientUsage.length,
                    total_estimated_cost: ingredientUsage.reduce((sum, item) => sum + (item.total_cost || 0), 0).toFixed(0)
                },
                nutrition_data: nutritionData,
                ingredient_usage: ingredientUsage
            };

            return report;
            
        } catch (error) {
            console.error('Error generating nutrition report:', error);
            throw error;
        }
    }

    // ================================================
    // XUẤT FILE EXCEL
    // ================================================

    async exportToExcel(reportData, reportType) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Báo Cáo');

            // Set worksheet properties
            worksheet.properties.defaultRowHeight = 20;

            if (reportType === 'health') {
                await this.createHealthExcelReport(worksheet, reportData);
            } else if (reportType === 'nutrition') {
                await this.createNutritionExcelReport(worksheet, reportData);
            }

            // Generate filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `bao-cao-${reportType}-${timestamp}.xlsx`;
            const filepath = path.join(this.reportsDir, filename);

            // Save file
            await workbook.xlsx.writeFile(filepath);

            return {
                success: true,
                filename: filename,
                filepath: filepath,
                download_url: `/reports/${filename}`
            };

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    async createHealthExcelReport(worksheet, reportData) {
        // Title
        worksheet.mergeCells('A1:P1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = reportData.title;
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };

        // Summary section
        worksheet.getCell('A3').value = 'TỔNG QUAN:';
        worksheet.getCell('A3').font = { bold: true };

        worksheet.getCell('A4').value = `Tổng số trẻ em: ${reportData.summary.total_children}`;
        worksheet.getCell('A5').value = `Đã có đánh giá sức khỏe: ${reportData.summary.valid_health_checks}`;
        worksheet.getCell('A6').value = `Chiều cao trung bình: ${reportData.summary.average_height} cm`;
        worksheet.getCell('A7').value = `Cân nặng trung bình: ${reportData.summary.average_weight} kg`;
        worksheet.getCell('A8').value = `BMI trung bình: ${reportData.summary.average_bmi}`;

        // Headers
        const headers = [
            'Mã HS', 'Họ tên', 'Lớp', 'Ngày sinh', 'Giới tính', 'Tuổi',
            'Ngày khám', 'Chiều cao (cm)', 'Cân nặng (kg)', 'BMI', 
            'Phân loại BMI', 'Mức độ chiều cao', 'Tình trạng sức khỏe',
            'Ăn uống', 'Hoạt động', 'Giáo viên'
        ];

        const headerRow = worksheet.getRow(10);
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Data rows
        reportData.data.forEach((child, index) => {
            const row = worksheet.getRow(11 + index);
            const values = [
                child.student_id,
                child.full_name,
                child.class_name,
                child.date_of_birth,
                child.gender === 'male' ? 'Nam' : 'Nữ',
                child.age_years,
                child.latest_check_date,
                child.height_cm,
                child.weight_kg,
                child.bmi,
                child.bmi_classification,
                child.height_percentile,
                child.tinh_trang_suc_khoe,
                child.an_uong,
                child.hoat_dong,
                child.teacher_name
            ];

            values.forEach((value, colIndex) => {
                const cell = row.getCell(colIndex + 1);
                cell.value = value;
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = 15;
        });
    }

    async createNutritionExcelReport(worksheet, reportData) {
        // Title
        worksheet.mergeCells('A1:L1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = reportData.title;
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };

        // Summary
        worksheet.getCell('A3').value = 'TỔNG QUAN:';
        worksheet.getCell('A3').font = { bold: true };
        worksheet.getCell('A4').value = `Tổng số thực đơn: ${reportData.summary.total_menus}`;
        worksheet.getCell('A5').value = `Calories trung bình/bữa: ${reportData.summary.avg_calories_per_meal}`;

        // Menu data headers
        const menuHeaders = [
            'Tên thực đơn', 'Ngày áp dụng', 'Loại bữa ăn', 'Lớp áp dụng',
            'Số trẻ dự kiến', 'Tổng Calories', 'Protein (g)', 'Fat (g)', 
            'Carbs (g)', 'Chi phí ước tính', 'Đánh giá', 'Người tạo'
        ];

        const menuHeaderRow = worksheet.getRow(8);
        menuHeaders.forEach((header, index) => {
            const cell = menuHeaderRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        });

        // Menu data
        reportData.nutrition_data.forEach((menu, index) => {
            const row = worksheet.getRow(9 + index);
            const values = [
                menu.ten_thuc_don,
                menu.ngay_ap_dung,
                menu.loai_bua_an,
                menu.lop_ap_dung,
                menu.so_tre_du_kien,
                menu.total_calories,
                menu.total_protein,
                menu.total_fat,
                menu.total_carbs,
                menu.estimated_cost,
                menu.avg_rating,
                menu.created_by_name
            ];

            values.forEach((value, colIndex) => {
                row.getCell(colIndex + 1).value = value;
            });
        });
    }

    // ================================================
    // XUẤT FILE PDF
    // ================================================

    async exportToPDF(reportData, reportType) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `bao-cao-${reportType}-${timestamp}.pdf`;
            const filepath = path.join(this.reportsDir, filename);

            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Add Vietnamese font support (simplified)
            doc.fontSize(20).text(reportData.title, { align: 'center' });
            doc.moveDown();

            if (reportType === 'health') {
                await this.createHealthPDFReport(doc, reportData);
            } else if (reportType === 'nutrition') {
                await this.createNutritionPDFReport(doc, reportData);
            }

            doc.end();

            return new Promise((resolve, reject) => {
                stream.on('finish', () => {
                    resolve({
                        success: true,
                        filename: filename,
                        filepath: filepath,
                        download_url: `/reports/${filename}`
                    });
                });
                stream.on('error', reject);
            });

        } catch (error) {
            console.error('Error exporting to PDF:', error);
            throw error;
        }
    }

    async createHealthPDFReport(doc, reportData) {
        // Summary section
        doc.fontSize(14).text('TONG QUAN:', { underline: true });
        doc.fontSize(12);
        doc.text(`Tong so tre em: ${reportData.summary.total_children}`);
        doc.text(`Da co danh gia suc khoe: ${reportData.summary.valid_health_checks}`);
        doc.text(`Chieu cao trung binh: ${reportData.summary.average_height} cm`);
        doc.text(`Can nang trung binh: ${reportData.summary.average_weight} kg`);
        doc.text(`BMI trung binh: ${reportData.summary.average_bmi}`);
        doc.moveDown();

        // BMI distribution
        doc.fontSize(14).text('PHAN BO BMI:', { underline: true });
        doc.fontSize(12);
        Object.entries(reportData.summary.bmi_distribution).forEach(([classification, count]) => {
            doc.text(`${classification}: ${count} tre`);
        });
        doc.moveDown();

        // Children data (first 20 records)
        doc.fontSize(14).text('CHI TIET TRE EM:', { underline: true });
        doc.fontSize(10);
        reportData.data.slice(0, 20).forEach((child, index) => {
            doc.text(`${index + 1}. ${child.full_name} - Lop ${child.class_name}`);
            doc.text(`   BMI: ${child.bmi} (${child.bmi_classification})`);
            doc.text(`   Chieu cao: ${child.height_cm}cm, Can nang: ${child.weight_kg}kg`);
            doc.moveDown(0.5);
        });
    }

    async createNutritionPDFReport(doc, reportData) {
        // Summary
        doc.fontSize(14).text('TONG QUAN DINH DUONG:', { underline: true });
        doc.fontSize(12);
        doc.text(`Tong so thuc don: ${reportData.summary.total_menus}`);
        doc.text(`Calories trung binh/bua: ${reportData.summary.avg_calories_per_meal}`);
        doc.text(`Tong chi phi uoc tinh: ${reportData.summary.total_estimated_cost} VND`);
        doc.moveDown();

        // Menu data (first 15 records)
        doc.fontSize(14).text('CHI TIET THUC DON:', { underline: true });
        doc.fontSize(10);
        reportData.nutrition_data.slice(0, 15).forEach((menu, index) => {
            doc.text(`${index + 1}. ${menu.ten_thuc_don} - ${menu.ngay_ap_dung}`);
            doc.text(`   Loai: ${menu.loai_bua_an}, Lop: ${menu.lop_ap_dung}`);
            doc.text(`   Calories: ${menu.total_calories}, Protein: ${menu.total_protein}g`);
            doc.moveDown(0.5);
        });
    }
}

module.exports = ReportingService;
