/**
 * Script tạo admin user mặc định
 */

const bcrypt = require('bcrypt');
const DatabaseManager = require('./database/DatabaseManager');

async function createDefaultAdmin() {
    const db = new DatabaseManager();
    
    try {
        await db.initialize();
        
        // Kiểm tra xem đã có admin chưa
        const existingAdmin = await db.query(
            'SELECT * FROM users WHERE role = "admin" LIMIT 1'
        );
        
        if (existingAdmin.length > 0) {
            console.log('Admin user đã tồn tại!');
            console.log('Email:', existingAdmin[0].email);
            console.log('Username:', existingAdmin[0].username);
            return;
        }
        
        // Tạo admin user mới
        const password = 'admin123';
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        const adminData = {
            username: 'admin',
            password_hash,
            full_name: 'Administrator',
            email: 'admin@kindergarten.com',
            phone: '0123456789',
            role: 'admin',
            is_active: true
        };
        
        const query = `
            INSERT INTO users 
            (username, password_hash, full_name, email, phone, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const values = [
            adminData.username,
            adminData.password_hash,
            adminData.full_name,
            adminData.email,
            adminData.phone,
            adminData.role,
            adminData.is_active
        ];
        
        await db.query(query, values);
        
        console.log('✅ Tạo admin user thành công!');
        console.log('Username:', adminData.username);
        console.log('Email:', adminData.email);
        console.log('Password:', password);
        console.log('Role:', adminData.role);
        
    } catch (error) {
        console.error('❌ Lỗi khi tạo admin user:', error.message);
    } finally {
        await db.close();
    }
}

// Chạy script
createDefaultAdmin();
