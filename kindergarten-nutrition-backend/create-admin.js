const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdmin() {
    try {
        // Kết nối database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'kindergarten_nutrition'
        });

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Tạo admin user
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password, role, full_name, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            ['admin', 'admin@kindergarten.com', hashedPassword, 'admin', 'Administrator', '0123456789']
        );

        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Role: admin');

        await connection.end();

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Admin user already exists!');
            console.log('Username: admin');
            console.log('Password: admin123');
        } else {
            console.error('❌ Error creating admin:', error.message);
        }
    }
}

createAdmin();