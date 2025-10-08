/**
 * Quản lý báo cáo dinh dưỡng
 */

class NutritionReport {
    constructor(db) {
        this.db = db;
    }

    async create(data) {
        const query = `
            INSERT INTO nutrition_reports
            (id, report_name, school_name, report_date, num_children, meals_per_day, nutrition_data, growth_data, menu_reviews, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return this.db.query(query, [
            data.id,
            data.report_name,
            data.school_name,
            data.report_date,
            data.num_children || 0,
            data.meals_per_day || 0,
            JSON.stringify(data.nutrition_data || []),
            JSON.stringify(data.growth_data || []),
            JSON.stringify(data.menu_reviews || []),
            data.created_by || null
        ]);
    }

    async getAll(filters = {}) {
        let query = `SELECT * FROM nutrition_reports WHERE 1=1`;
        const params = [];

        if (filters.name) {
            query += ` AND school_name LIKE ?`;
            params.push(`%${filters.name}%`);
        }
        if (filters.month) {
            query += ` AND DATE_FORMAT(report_date, '%Y-%m') = ?`;
            params.push(filters.month);
        }
        if (filters.creator) {
            query += ` AND created_by LIKE ?`;
            params.push(`%${filters.creator}%`);
        }

        return this.db.query(query, params);
    }

    async getById(id) {
        return this.db.query(`SELECT * FROM nutrition_reports WHERE id = ?`, [id]);
    }

    async update(id, data) {
        const query = `
            UPDATE nutrition_reports
            SET nutrition_data = ?, growth_data = ?, menu_reviews = ?, updated_at = NOW()
            WHERE id = ?
        `;
        return this.db.query(query, [
            JSON.stringify(data.nutrition_data || []),
            JSON.stringify(data.growth_data || []),
            JSON.stringify(data.menu_reviews || []),
            id
        ]);
    }

    async delete(id) {
        return this.db.query(`DELETE FROM nutrition_reports WHERE id = ?`, [id]);
    }
}

module.exports = NutritionReport;
