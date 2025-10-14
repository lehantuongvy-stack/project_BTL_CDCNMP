/**
 * Database Manager - MySQL Connection với Database Schema
 * Unified version - Kết hợp Basic + Advanced features
 * Quản lý kết nối và truy vấn MySQL cho Kindergarten Nutrition Management
 */

const mysql = require('mysql2/promise');

class DatabaseManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kindergarten_nutrition',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            charset: 'utf8mb4'
        };
    }

    // Khởi tạo connection pool
    async initialize() {
        try {
            this.pool = mysql.createPool(this.config);
            
            // Test connection
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            console.log(' Connected to Enhanced MySQL database successfully');
            console.log(` Database: ${this.config.database} at ${this.config.host}:${this.config.port}`);
            
            return true;
        } catch (error) {
            console.error(' Enhanced Database connection failed:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    // Kiểm tra kết nối
    async isHealthy() {
        if (!this.pool || !this.isConnected) {
            return false;
        }
        
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            return true;
        } catch (error) {
            console.error('Database health check failed:', error.message);
            return false;
        }
    }

    // Thực hiện query
    async query(sql, params = []) {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }

        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Query error:', error.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw error;
        }
    }
    
    // Đóng kết nối
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('Enhanced Database connection closed');
        }
    }

    // Transaction support
    async beginTransaction() {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    async commit(connection) {
        await connection.commit();
        connection.release();
    }

    async rollback(connection) {
        await connection.rollback();
        connection.release();
    }

    // -------------------- USERS --------------------
    async createUser(userData) {
        const sql = `
            INSERT INTO users (id, username, email, password_hash, full_name, role, phone, address, chuc_vu)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            userData.username,
            userData.email,
            userData.password_hash,
            userData.full_name,
            userData.role || 'teacher',
            userData.phone || null,
            userData.address || null,
            userData.chuc_vu || null
        ];
        
        const result = await this.query(sql, params);
        
        // Get the created user (MySQL doesn't return the UUID directly)
        const getUserSql = 'SELECT * FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1';
        const users = await this.query(getUserSql, [userData.email]);
        return users[0] || null;
    }

    async getUserById(id) {
        const sql = 'SELECT * FROM users WHERE id = ? AND is_active = true';
        const results = await this.query(sql, [id]);
        return results[0] || null;
    }

    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ? AND is_active = true';
        const results = await this.query(sql, [email]);
        return results[0] || null;
    }

    async getAllUsers(filters = {}) {
        let sql = 'SELECT * FROM users WHERE is_active = true';
        const params = [];

        if (filters.role) {
            sql += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.search) {
            sql += ' AND (full_name LIKE ? OR email LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        return await this.query(sql, params);
    }

    // -------------------- CHILDREN --------------------
    async createChild(childData) {
        const sql = `
            INSERT INTO children (id, student_id, full_name, date_of_birth, gender, class_name, 
                                parent_id, teacher_id, height, weight, allergies, medical_conditions, emergency_contact)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            childData.student_id,
            childData.full_name,
            childData.date_of_birth,
            childData.gender,
            childData.class_name || null,
            childData.parent_id || null,
            childData.teacher_id || null,
            childData.height || 0,
            childData.weight || 0,
            JSON.stringify(childData.allergies || []),
            JSON.stringify(childData.medical_conditions || []),
            JSON.stringify(childData.emergency_contact || {})
        ];

        const result = await this.query(sql, params);
        
        // Get the created child
        const getChildSql = 'SELECT * FROM children WHERE student_id = ? ORDER BY created_at DESC LIMIT 1';
        const children = await this.query(getChildSql, [childData.student_id]);
        return children[0] || null;
    }

    async getChildrenByParentId(parentId) {
        const sql = `
            SELECT c.*, u.full_name as parent_name, t.full_name as teacher_name
            FROM children c
            LEFT JOIN users u ON c.parent_id = u.id
            LEFT JOIN users t ON c.teacher_id = t.id
            WHERE c.parent_id = ? AND c.is_active = true
            ORDER BY c.full_name
        `;
        return await this.query(sql, [parentId]);
    }

    async getAllChildren(filters = {}) {
        let sql = `
            SELECT c.*, u.full_name as parent_name, t.full_name as teacher_name
            FROM children c
            LEFT JOIN users u ON c.parent_id = u.id
            LEFT JOIN users t ON c.teacher_id = t.id
            WHERE c.is_active = true
        `;
        const params = [];

        if (filters.class_name) {
            sql += ' AND c.class_name = ?';
            params.push(filters.class_name);
        }

        if (filters.teacher_id) {
            sql += ' AND c.teacher_id = ?';
            params.push(filters.teacher_id);
        }

        if (filters.parent_id) {
            sql += ' AND c.parent_id = ?';
            params.push(filters.parent_id);
        }

        sql += ' ORDER BY c.class_name, c.full_name';
        return await this.query(sql, params);
    }

    // -------------------- NGUYÊN LIỆU (INGREDIENTS) --------------------
    async createNguyenLieu(data) {
        const sql = `
            INSERT INTO nguyen_lieu (id, ten_nguyen_lieu, mo_ta, don_vi_tinh, gia_mua, 
                                   calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g,
                                   fiber_per_100g, vitamin_a, vitamin_c, calcium, iron, allergens, nha_cung_cap_id)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.ten_nguyen_lieu,
            data.mo_ta || null,
            data.don_vi_tinh || 'kg',
            data.gia_mua || 0,
            data.calories_per_100g || 0,
            data.protein_per_100g || 0,
            data.fat_per_100g || 0,
            data.carbs_per_100g || 0,
            data.fiber_per_100g || 0,
            data.vitamin_a || 0,
            data.vitamin_c || 0,
            data.calcium || 0,
            data.iron || 0,
            JSON.stringify(data.allergens || []),
            data.nha_cung_cap_id || null
        ];

        const result = await this.query(sql, params);
        
        // Get the created ingredient
        const getNguyenLieuSql = 'SELECT * FROM nguyen_lieu WHERE ten_nguyen_lieu = ? ORDER BY created_at DESC LIMIT 1';
        const nguyenLieu = await this.query(getNguyenLieuSql, [data.ten_nguyen_lieu]);
        return nguyenLieu[0] || null;
    }

    async getAllNguyenLieu(filters = {}) {
        let sql = `
            SELECT nl.*, ncc.ten_ncc as ten_nha_cung_cap
            FROM nguyen_lieu nl
            LEFT JOIN nha_cung_cap ncc ON nl.nha_cung_cap_id = ncc.id
            WHERE nl.trang_thai != 'discontinued'
        `;
        const params = [];

        if (filters.search) {
            sql += ' AND nl.ten_nguyen_lieu LIKE ?';
            params.push(`%${filters.search}%`);
        }

        if (filters.trang_thai) {
            sql += ' AND nl.trang_thai = ?';
            params.push(filters.trang_thai);
        }

        sql += ' ORDER BY nl.ten_nguyen_lieu';
        return await this.query(sql, params);
    }

    // -------------------- MÓN ĂN (DISHES) --------------------
    async createMonAn(data) {
        const sql = `
            INSERT INTO mon_an (id, ten_mon_an, mo_ta, loai_mon, do_tuoi_phu_hop, 
                              thoi_gian_che_bien, khau_phan_chuan, huong_dan_che_bien, created_by)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.ten_mon_an,
            data.mo_ta || null,
            data.loai_mon || 'main_dish',
            data.do_tuoi_phu_hop || null,
            data.thoi_gian_che_bien || 0,
            data.khau_phan_chuan || 1,
            data.huong_dan_che_bien || null,
            data.created_by
        ];

        const result = await this.query(sql, params);
        
        // Get the created dish
        const getMonAnSql = 'SELECT * FROM mon_an WHERE ten_mon_an = ? ORDER BY created_at DESC LIMIT 1';
        const monAn = await this.query(getMonAnSql, [data.ten_mon_an]);
        return monAn[0] || null;
    }

    async getAllMonAn(filters = {}) {
        let sql = `
            SELECT ma.*, u.full_name as created_by_name
            FROM mon_an ma
            LEFT JOIN users u ON ma.created_by = u.id
            WHERE ma.trang_thai = 'active'
        `;
        const params = [];

        if (filters.loai_mon) {
            sql += ' AND ma.loai_mon = ?';
            params.push(filters.loai_mon);
        }

        if (filters.search) {
            sql += ' AND ma.ten_mon_an LIKE ?';
            params.push(`%${filters.search}%`);
        }

        sql += ' ORDER BY ma.ten_mon_an';
        return await this.query(sql, params);
    }

    // -------------------- THỰC ĐƠN (MENUS) --------------------
    async createThucDon(data) {
        const sql = `
            INSERT INTO thuc_don (id, ten_thuc_don, ngay_ap_dung, loai_bua_an, 
                                lop_ap_dung, so_tre_du_kien, ghi_chu, created_by)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.ten_thuc_don,
            data.ngay_ap_dung,
            data.loai_bua_an,
            data.lop_ap_dung || null,
            data.so_tre_du_kien || 0,
            data.ghi_chu || null,
            data.created_by
        ];

        const result = await this.query(sql, params);
        
        // Get the created menu
        const getThucDonSql = 'SELECT * FROM thuc_don WHERE ten_thuc_don = ? ORDER BY created_at DESC LIMIT 1';
        const thucDon = await this.query(getThucDonSql, [data.ten_thuc_don]);
        return thucDon[0] || null;
    }

    async getThucDonByDate(date, filters = {}) {
        let sql = `
            SELECT td.*, u.full_name as created_by_name
            FROM thuc_don td
            LEFT JOIN users u ON td.created_by = u.id
            WHERE DATE(td.ngay_ap_dung) = ?
        `;
        const params = [date];

        if (filters.loai_bua_an) {
            sql += ' AND td.loai_bua_an = ?';
            params.push(filters.loai_bua_an);
        }

        if (filters.lop_ap_dung) {
            sql += ' AND td.lop_ap_dung = ?';
            params.push(filters.lop_ap_dung);
        }

        sql += ' ORDER BY td.loai_bua_an, td.ten_thuc_don';
        return await this.query(sql, params);
    }

    // -------------------- NHÀ CUNG CẤP (SUPPLIERS) --------------------
    async createNhaCungCap(data) {
        const sql = `
            INSERT INTO nha_cung_cap (ten_ncc, phone, dia_chi, email)
            VALUES (?, ?, ?, ?)
        `;
        const params = [data.ten_ncc, data.phone || null, data.dia_chi || null, data.email || null];
        const result = await this.query(sql, params);
        
        // Get the created supplier
        const getNccSql = 'SELECT * FROM nha_cung_cap WHERE ten_ncc = ? ORDER BY created_at DESC LIMIT 1';
        const ncc = await this.query(getNccSql, [data.ten_ncc]);
        return ncc[0] || null;
    }

    async getAllNhaCungCap() {
        const sql = 'SELECT * FROM nha_cung_cap WHERE trang_thai = "active" ORDER BY ten_ncc';
        return await this.query(sql);
    }

    // -------------------- KHO HÀNG --------------------
    async getInventoryStatus() {
        const sql = 'SELECT * FROM v_ton_kho ORDER BY trang_thai_ton DESC, ten_nguyen_lieu';
        return await this.query(sql);
    }

    async updateInventory(nguyen_lieu_id, so_luong_moi, ly_do = 'manual_update') {
        // Check if inventory record exists
        const checkSql = 'SELECT id FROM kho_hang WHERE nguyen_lieu_id = ?';
        const existing = await this.query(checkSql, [nguyen_lieu_id]);
        
        if (existing.length > 0) {
            // Update existing
            const sql = `
                UPDATE kho_hang 
                SET so_luong_ton = ?, ngay_cap_nhat = CURRENT_TIMESTAMP
                WHERE nguyen_lieu_id = ?
            `;
            return await this.query(sql, [so_luong_moi, nguyen_lieu_id]);
        } else {
            // Create new inventory record
            const sql = `
                INSERT INTO kho_hang (nguyen_lieu_id, so_luong_ton, suc_chua_toi_da, muc_canh_bao_ton_it)
                VALUES (?, ?, ?, ?)
            `;
            return await this.query(sql, [nguyen_lieu_id, so_luong_moi, so_luong_moi * 5, so_luong_moi * 0.2]);
        }
    }

    // -------------------- ĐÁNH GIÁ SỨC KHỎE --------------------
    async createDanhGiaSucKhoe(data) {
        const sql = `
            INSERT INTO danh_gia_suc_khoe (child_id, teacher_id, chieu_cao, can_nang,
                                         tinh_trang_suc_khoe, ket_luan, khuyen_cao,
                                         an_uong, hoat_dong, tinh_than, lan_danh_gia_tiep_theo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.child_id,
            data.teacher_id,
            data.chieu_cao || null,
            data.can_nang || null,
            data.tinh_trang_suc_khoe || null,
            data.ket_luan || null,
            data.khuyen_cao || null,
            data.an_uong || 'good',
            data.hoat_dong || 'normal',
            data.tinh_than || 'normal',
            data.lan_danh_gia_tiep_theo || null
        ];

        return await this.query(sql, params);
    }

    async getDanhGiaSucKhoeByChild(childId, limit = 10) {
        const sql = `
            SELECT dgsk.*, c.full_name as child_name, u.full_name as teacher_name
            FROM danh_gia_suc_khoe dgsk
            JOIN children c ON dgsk.child_id = c.id
            JOIN users u ON dgsk.teacher_id = u.id
            WHERE dgsk.child_id = ?
            ORDER BY dgsk.ngay_danh_gia DESC
            LIMIT ?
        `;
        return await this.query(sql, [childId, limit]);
    }

    // -------------------- Ý KIẾN PHỤ HUYNH --------------------
    async createYKienPhuHuynh(data) {
        const sql = `
            INSERT INTO y_kien_phu_huynh (parent_id, child_id, thuc_don_id, mon_an_id,
                                        loai_y_kien, tieu_de, noi_dung, danh_gia_sao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.parent_id,
            data.child_id || null,
            data.thuc_don_id || null,
            data.mon_an_id || null,
            data.loai_y_kien || 'suggestion',
            data.tieu_de || null,
            data.noi_dung,
            data.danh_gia_sao || null
        ];

        return await this.query(sql, params);
    }

    async getYKienPhuHuynh(filters = {}) {
        let sql = `
            SELECT yk.*, u.full_name as parent_name, c.full_name as child_name
            FROM y_kien_phu_huynh yk
            JOIN users u ON yk.parent_id = u.id
            LEFT JOIN children c ON yk.child_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.parent_id) {
            sql += ' AND yk.parent_id = ?';
            params.push(filters.parent_id);
        }

        if (filters.trang_thai) {
            sql += ' AND yk.trang_thai = ?';
            params.push(filters.trang_thai);
        }

        sql += ' ORDER BY yk.created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        return await this.query(sql, params);
    }

    // -------------------- THỐNG KÊ & REPORTS --------------------
    async getNutritionStatsByMenu(thuc_don_id) {
        const sql = `
            SELECT 
                td.ten_thuc_don,
                td.ngay_ap_dung,
                td.loai_bua_an,
                SUM(ma.total_calories * cttd.so_khau_phan) as tong_calories,
                SUM(ma.total_protein * cttd.so_khau_phan) as tong_protein,
                SUM(ma.total_fat * cttd.so_khau_phan) as tong_fat,
                SUM(ma.total_carbs * cttd.so_khau_phan) as tong_carbs
            FROM thuc_don td
            JOIN chi_tiet_thuc_don cttd ON td.id = cttd.thuc_don_id
            JOIN mon_an ma ON cttd.mon_an_id = ma.id
            WHERE td.id = ?
            GROUP BY td.id
        `;
        const results = await this.query(sql, [thuc_don_id]);
        return results[0] || null;
    }

    async getChildHealthStats(child_id) {
        const sql = `
            SELECT 
                COUNT(*) as total_assessments,
                AVG(chieu_cao) as avg_height,
                AVG(can_nang) as avg_weight,
                AVG(bmi) as avg_bmi,
                MAX(ngay_danh_gia) as last_assessment_date
            FROM danh_gia_suc_khoe 
            WHERE child_id = ?
        `;
        const results = await this.query(sql, [child_id]);
        return results[0] || null;
    }

    // Test database với sample data
    async testDatabase() {
        try {
            console.log(' Testing Enhanced Database...');
            
            // Test users
            const users = await this.getAllUsers();
            console.log(` Found ${users.length} users`);
            
            // Test nguyên liệu
            const nguyenLieu = await this.getAllNguyenLieu();
            console.log(` Found ${nguyenLieu.length} ingredients`);
            
            // Test nhà cung cấp
            const nhaCungCap = await this.getAllNhaCungCap();
            console.log(` Found ${nhaCungCap.length} suppliers`);
            
            console.log(' Enhanced Database test completed successfully!');
            return true;
        } catch (error) {
            console.error(' Enhanced Database test failed:', error.message);
            return false;
        }
    }
}

module.exports = DatabaseManager;
