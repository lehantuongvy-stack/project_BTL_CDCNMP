/**
 * Meal Model - Quản lý bữa ăn và thực đơn hàng ngày
 */

const DatabaseManager = require('../database/DatabaseManager');

class Meal {
    constructor(db = null) {
        this.db = db || new DatabaseManager();
    }

    /**
     * Lấy tất cả món ăn để hiển thị trong dropdown
     */
    async getAllDishes() {
        try {
            const query = `
                SELECT 
                    id, ten_mon_an, mo_ta,
                    total_calories as calories_per_serving, 
                    total_protein as protein_per_serving,
                    total_carbs as carbs_per_serving, 
                    total_fat as fat_per_serving,
                    loai_mon as loai_mon_an,
                    do_tuoi_phu_hop, thoi_gian_che_bien, khau_phan_chuan
                FROM mon_an 
                WHERE (trang_thai = 'active' OR trang_thai = '' OR trang_thai IS NULL)
                ORDER BY loai_mon, ten_mon_an
            `;
            
            const dishes = await this.db.query(query);
            return dishes || [];
        } catch (error) {
            console.error('Error getting all dishes:', error);
            throw new Error('Lỗi khi lấy danh sách món ăn: ' + error.message);
        }
    }

    /**
     * Tạo thực đơn với chi tiết món ăn
     */
    async createMenuWithDetails(menuData) {
        try {
            const { v4: uuidv4 } = require('uuid');
            const menuId = uuidv4();     
            const {
                ten_thuc_don,
                ngay_ap_dung,
                loai_bua_an,
                nhom_lop,
                so_tre_du_kien = 30,
                trang_thai = 'active',
                created_by,
                ghi_chu = '',
                mon_an_list = [] // Array các món ăn với số lượng
            } = menuData;
            
            // Validation
            if (!ten_thuc_don || !ngay_ap_dung || !loai_bua_an) {
                throw new Error('Thiếu thông tin bắt buộc: tên thực đơn, ngày áp dụng, loại bữa ăn');
            }

            // Tạo thực đơn chính
            const menuQuery = `
                INSERT INTO thuc_don (
                    id, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                    nhom_lop, so_tre_du_kien, trang_thai,
                    created_by, ghi_chu, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const menuValues = [
                menuId, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                nhom_lop, so_tre_du_kien, trang_thai,
                created_by, ghi_chu
            ];
            
            await this.db.query(menuQuery, menuValues);

            // Thêm chi tiết món ăn
            if (mon_an_list.length > 0) {
                for (const monAn of mon_an_list) {
                    // Map loai_bua_an sang tiếng Việt cho cột buoi
                    const buoiMap = {
                        'breakfast': 'Sáng',
                        'lunch': 'Trưa', 
                        'dinner': 'Tối',
                        'snack': 'Xế'
                    };
                    
                    const detailQuery = `
                        INSERT INTO chi_tiet_thuc_don (
                            thuc_don_id, mon_an_id, buoi, so_khau_phan, 
                            ghi_chu
                        ) VALUES (?, ?, ?, ?, ?)
                    `;
                    
                    await this.db.query(detailQuery, [
                        menuId, monAn.mon_an_id, buoiMap[loai_bua_an] || 'Trưa',
                        monAn.so_khau_phan || so_tre_du_kien, 
                        monAn.ghi_chu || ''
                    ]);
                }
            }

            return await this.getMenuWithDetails(menuId);

        } catch (error) {
            console.error('Error creating menu with details:', error);
            throw new Error('Lỗi khi tạo thực đơn: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn với chi tiết món ăn
     */
    async getMenuWithDetails(menuId) {
        try {
            // Lấy thông tin thực đơn
            const menuQuery = `
                SELECT * FROM thuc_don WHERE id = ?
            `;
            const menu = await this.db.query(menuQuery, [menuId]);
            
            if (!menu || menu.length === 0) {
                return null;
            }

            // Lấy chi tiết món ăn
            const detailQuery = `
                SELECT 
                    ctd.id as chi_tiet_id,
                    ctd.so_khau_phan,
                    ctd.ghi_chu as chi_tiet_ghi_chu,
                    ma.*
                FROM chi_tiet_thuc_don ctd
                JOIN mon_an ma ON ctd.mon_an_id = ma.id
                WHERE ctd.thuc_don_id = ?
                ORDER BY ma.loai_mon, ma.ten_mon_an
            `;
            
            const details = await this.db.query(detailQuery, [menuId]);

            return {
                ...menu[0],
                chi_tiet_mon_an: details || []
            };

        } catch (error) {
            console.error('Error getting menu with details:', error);
            throw new Error('Lỗi khi lấy chi tiết thực đơn: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ngày với chi tiết
     */
    async getMenuByDateWithDetails(date, lopApDung = null) {
        try {
            let query = `
                SELECT 
                    td.id, td.ten_thuc_don, td.ngay_ap_dung, 
                    td.loai_bua_an, td.nhom_lop, td.so_tre_du_kien, td.trang_thai,
                    td.ghi_chu, td.created_by, td.created_at, 
                    ma.ten_mon_an, 
                    ma.total_calories as calories_per_serving, 
                    ma.total_protein as protein_per_serving,
                    ma.total_carbs as carbs_per_serving, 
                    ma.total_fat as fat_per_serving,
                    ma.loai_mon as loai_mon_an,
                    ctd.so_khau_phan, ctd.ghi_chu as chi_tiet_ghi_chu
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                WHERE DATE(td.ngay_ap_dung) = ?
            `;
            const values = [date];

             if (lopApDung) {
                 query += ' AND td.lop_ap_dung = ?';
                 values.push(lopApDung);
             }

            query += ' ORDER BY td.loai_bua_an, ma.loai_mon';

            const results = await this.db.query(query, values);

            if (!results || results.length === 0) {
                console.warn(" Không có chi tiết món ăn cho ngày:", date);
                return [];
            }

            // Nhóm theo loại bữa ăn
            const groupedMenus = this.groupMenusByMealType(results);
            return groupedMenus;

        } catch (error) {
            console.error('Error getting menu by date with details:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ngày: ' + error.message);
        }
    }

    /**
     * Nhóm thực đơn theo loại bữa ăn
     */
    groupMenusByMealType(results) {
        const grouped = {};

        results.forEach(item => {
            const key = `${item.loai_bua_an}_${item.nhom_lop || 'all'}`;
            
            if (!grouped[key]) {
                grouped[key] = {
                    thuc_don_info: {
                        id: item.id,
                        ten_thuc_don: item.ten_thuc_don,
                        ngay_ap_dung: item.ngay_ap_dung,
                        loai_bua_an: item.loai_bua_an,
                        nhom_lop: item.nhom_lop,
                        so_tre_du_kien: item.so_tre_du_kien,
                        trang_thai: item.trang_thai
                    },
                    mon_an_list: []
                };
            }

            if (item.ten_mon_an) {
                grouped[key].mon_an_list.push({
                    ten_mon_an: item.ten_mon_an,
                    calories_per_serving: item.calories_per_serving,
                    protein_per_serving: item.protein_per_serving,
                    carbs_per_serving: item.carbs_per_serving,
                    fat_per_serving: item.fat_per_serving,
                    gia_tien: item.gia_tien,
                    so_khau_phan: item.so_khau_phan,
                    ghi_chu: item.chi_tiet_ghi_chu
                });
            }
        });

        return grouped;
    }

    /**
     * Cập nhật thực đơn với chi tiết món ăn
     */
    async updateMenuWithDetails(menuId, updateData) {
        try {
            console.log(' Debug updateMenuWithDetails - menuId:', menuId);
            console.log(' Debug updateMenuWithDetails - updateData:', JSON.stringify(updateData, null, 2));
            
            const {
                ten_thuc_don,
                ngay_ap_dung,
                loai_bua_an,
                nhom_lop, // Frontend gửi nhom_lop không phải lop_ap_dung
                so_tre_du_kien,
                trang_thai,
                ghi_chu,
                mon_an_list // KHÔNG gán default value = []
            } = updateData;

            // Cập nhật thông tin thực đơn chính
            const menuFields = [];
            const menuValues = [];

            if (ten_thuc_don !== undefined && ten_thuc_don !== null) {
                menuFields.push('ten_thuc_don = ?');
                menuValues.push(ten_thuc_don);
            }
            if (ngay_ap_dung !== undefined && ngay_ap_dung !== null) {
                menuFields.push('ngay_ap_dung = ?');
                menuValues.push(ngay_ap_dung);
            }
            if (loai_bua_an !== undefined && loai_bua_an !== null) {
                menuFields.push('loai_bua_an = ?');
                menuValues.push(loai_bua_an);
            }
            if (nhom_lop !== undefined && nhom_lop !== null) {
                menuFields.push('nhom_lop = ?');
                menuValues.push(nhom_lop);
            }
            if (so_tre_du_kien !== undefined && so_tre_du_kien !== null) {
                menuFields.push('so_tre_du_kien = ?');
                menuValues.push(so_tre_du_kien);
            }
            if (trang_thai !== undefined && trang_thai !== null) {
                menuFields.push('trang_thai = ?');
                menuValues.push(trang_thai);
            }
            if (ghi_chu !== undefined) {
                menuFields.push('ghi_chu = ?');
                menuValues.push(ghi_chu || ''); 
            }

            if (menuFields.length > 0) {
                menuValues.push(menuId);
                const menuQuery = `
                    UPDATE thuc_don 
                    SET ${menuFields.join(', ')}, updated_at = NOW() 
                    WHERE id = ?
                `;
                menuValues.forEach((val, idx) => {
                    console.log(`  [${idx}]: ${val} (type: ${typeof val})`);
                    if (val === undefined) {
                        console.error(` FOUND UNDEFINED at index ${idx}!`);
                    }
                });
                await this.db.query(menuQuery, menuValues);
            }

            // Cập nhật chi tiết món ăn chỉ khi có dữ liệu món ăn được gửi lên
            // Kiểm tra xem có gửi mon_an_list từ frontend không (có thể là array rỗng hoặc có dữ liệu)
            if (updateData.hasOwnProperty('mon_an_list')) {
                await this.db.query('DELETE FROM chi_tiet_thuc_don WHERE thuc_don_id = ?', [menuId]);

                // Thêm chi tiết mới nếu có
                if (mon_an_list.length > 0) {
                    console.log(' Adding', mon_an_list.length, 'new dishes to menu:', menuId);
                    for (const monAn of mon_an_list) {
                        // Map loai_bua_an sang tiếng Việt cho cột buoi
                        const buoiMap = {
                            'breakfast': 'Sáng',
                            'lunch': 'Trưa', 
                            'dinner': 'Tối',
                            'snack': 'Xế'
                        };
                        
                        const detailQuery = `
                            INSERT INTO chi_tiet_thuc_don (
                                thuc_don_id, mon_an_id, buoi, so_khau_phan, 
                                ghi_chu
                            ) VALUES (?, ?, ?, ?, ?)
                        `;
                        
                        // Validate monAn object to avoid undefined values
                        const validatedMonAn = {
                            mon_an_id: monAn.mon_an_id,
                            so_khau_phan: monAn.so_khau_phan || so_tre_du_kien || 30,
                            ghi_chu: monAn.ghi_chu || ''
                        };
                        
                        if (!validatedMonAn.mon_an_id) {
                            console.error(' Invalid mon_an_id:', monAn);
                            continue; 
                        }
                        
                        await this.db.query(detailQuery, [
                            menuId, validatedMonAn.mon_an_id, buoiMap[loai_bua_an] || 'Trưa',
                            validatedMonAn.so_khau_phan, validatedMonAn.ghi_chu
                        ]);
                    }
                }
            } else {
                console.log(' mon_an_list not provided - keeping existing dish details');
            }

            return await this.getMenuWithDetails(menuId);

        } catch (error) {
            console.error('Error updating menu with details:', error);
            throw new Error('Lỗi khi cập nhật thực đơn: ' + error.message);
        }
    }

    /**
     * Cập nhật thực đơn thông minh - dành cho nút Sửa/Lưu từ frontend
     * Chỉ cập nhật những thông tin thay đổi, bảo toàn dữ liệu cũ
     */
    async updateMenuSmart(menuId, updateData) {
        try {
            console.log(' Smart Update - menuId:', menuId);
            console.log(' Smart Update - updateData:', JSON.stringify(updateData, null, 2));
            
            const {
                ten_thuc_don,
                ngay_ap_dung,
                loai_bua_an,
                nhom_lop,
                so_tre_du_kien,
                trang_thai,
                ghi_chu,
                mon_an_list,
                update_mode = 'smart' // 'smart' hoặc 'replace'
            } = updateData;

            // Lấy dữ liệu hiện tại của menu
            const currentMenu = await this.getMenuWithDetails(menuId);
            if (!currentMenu) {
                throw new Error('Không tìm thấy thực đơn để cập nhật');
            }

            // 1. Cập nhật thông tin cơ bản của thực đơn
            const basicUpdateData = {
                ten_thuc_don,
                ngay_ap_dung,
                loai_bua_an,
                nhom_lop,
                so_tre_du_kien,
                trang_thai,
                ghi_chu
            };

            // Lọc ra những field có giá trị
            const filteredBasicData = {};
            Object.keys(basicUpdateData).forEach(key => {
                if (basicUpdateData[key] !== undefined && basicUpdateData[key] !== null) {
                    filteredBasicData[key] = basicUpdateData[key];
                }
            });

            if (Object.keys(filteredBasicData).length > 0) {
                await this.updateMenuBasicInfo(menuId, filteredBasicData);
                console.log(' Updated basic menu info');
            }

            // 2. Xử lý món ăn một cách thông minh
            if (mon_an_list !== undefined) {
                console.log(' Processing dish list - mode:', update_mode);
                
                // Kiểm tra và làm sạch dữ liệu món ăn
                let validDishes = [];
                let hasInvalidDishes = false;
                
                if (Array.isArray(mon_an_list)) {
                    validDishes = mon_an_list.filter(dish => {
                        if (!dish.mon_an_id) {
                            hasInvalidDishes = true;
                            console.log(' Found invalid dish (missing mon_an_id):', dish);
                            return false;
                        }
                        return true;
                    });
                }
                
                if (hasInvalidDishes) {
                    console.log(` Filtered out ${mon_an_list.length - validDishes.length} invalid dishes`);
                    
                    // Nếu tất cả món ăn đều invalid, chỉ cập nhật thông tin cơ bản
                    if (validDishes.length === 0) {
                        return await this.getMenuWithDetails(menuId);
                    }
                }
                
                if (update_mode === 'replace') {
                    await this.db.query('DELETE FROM chi_tiet_thuc_don WHERE thuc_don_id = ?', [menuId]);
                    
                    if (validDishes.length > 0) {
                        for (const dish of validDishes) {
                            try {
                                await this.addDishToMenu(menuId, dish);
                            } catch (error) {
                                console.log(' Failed to add dish in replace mode:', dish, 'Error:', error.message);
                            }
                        }
                    }
                } else {
                    if (validDishes.length > 0) {
                        const currentDishes = currentMenu.chi_tiet_mon_an || [];
                        const currentDishIds = currentDishes.map(d => d.id);
                        const newDishIds = validDishes.map(d => d.mon_an_id);
                        
                        // Xóa những món không còn trong danh sách mới
                        for (const currentDish of currentDishes) {
                            if (!newDishIds.includes(currentDish.id)) {
                                console.log(' Removing dish:', currentDish.ten_mon_an);
                                try {
                                    await this.removeDishFromMenu(menuId, currentDish.id);
                                } catch (error) {
                                    console.log(' Failed to remove dish:', currentDish.ten_mon_an, 'Error:', error.message);
                                }
                            }
                        }
                        
                        // Thêm/cập nhật những món trong danh sách mới
                        for (const newDish of validDishes) {
                            if (currentDishIds.includes(newDish.mon_an_id)) {
                                console.log(' Updating dish:', newDish.mon_an_id);
                                try {
                                    await this.db.query(
                                        'UPDATE chi_tiet_thuc_don SET so_khau_phan = ?, ghi_chu = ? WHERE thuc_don_id = ? AND mon_an_id = ?',
                                        [newDish.so_khau_phan || 30, newDish.ghi_chu || '', menuId, newDish.mon_an_id]
                                    );
                                } catch (error) {
                                    console.log(' Failed to update dish:', newDish.mon_an_id, 'Error:', error.message);
                                }
                            } else {
                                console.log(' Adding new dish:', newDish.mon_an_id);
                                try {
                                    await this.addDishToMenu(menuId, newDish);
                                } catch (error) {
                                    console.log(' Failed to add dish:', newDish, 'Error:', error.message);

                                }
                            }
                        }
                    } else {
                        console.log(' No valid dishes to process - keeping existing dishes');
                    }
                }
            } else {
                console.log(' No dish list provided - keeping existing dishes');
            }

            return await this.getMenuWithDetails(menuId);

        } catch (error) {
            console.error('Error in smart update:', error);
            throw new Error('Lỗi khi cập nhật thực đơn thông minh: ' + error.message);
        }
    }

    /**
     * Thêm món ăn vào thực đơn (không xóa món cũ)
     */
    async addDishToMenu(menuId, dishData) {
        try {
            const { mon_an_id, so_khau_phan = 30, ghi_chu = '', loai_bua_an = 'lunch' } = dishData;

            if (!mon_an_id) {
                throw new Error('Thiếu ID món ăn');
            }

            // Kiểm tra thực đơn có tồn tại không
            const menu = await this.db.query('SELECT * FROM thuc_don WHERE id = ?', [menuId]);
            if (!menu || menu.length === 0) {
                throw new Error('Không tìm thấy thực đơn');
            }

            // Kiểm tra món ăn đã có trong thực đơn chưa
            const existing = await this.db.query(
                'SELECT * FROM chi_tiet_thuc_don WHERE thuc_don_id = ? AND mon_an_id = ?', 
                [menuId, mon_an_id]
            );

            if (existing && existing.length > 0) {
                // Cập nhật số khẩu phần nếu món đã có
                await this.db.query(
                    'UPDATE chi_tiet_thuc_don SET so_khau_phan = ?, ghi_chu = ? WHERE thuc_don_id = ? AND mon_an_id = ?',
                    [so_khau_phan, ghi_chu, menuId, mon_an_id]
                );
            } else {
                // Thêm món mới
                const buoiMap = {
                    'breakfast': 'Sáng',
                    'lunch': 'Trưa', 
                    'dinner': 'Tối',
                    'snack': 'Xế'
                };

                await this.db.query(
                    'INSERT INTO chi_tiet_thuc_don (thuc_don_id, mon_an_id, buoi, so_khau_phan, ghi_chu) VALUES (?, ?, ?, ?, ?)',
                    [menuId, mon_an_id, buoiMap[loai_bua_an] || 'Trưa', so_khau_phan, ghi_chu]
                );
            }

            return await this.getMenuWithDetails(menuId);

        } catch (error) {
            console.error('Error adding dish to menu:', error);
            throw new Error('Lỗi khi thêm món vào thực đơn: ' + error.message);
        }
    }

    /**
     * Xóa món ăn khỏi thực đơn
     */
    async removeDishFromMenu(menuId, monAnId) {
        try {
            if (!monAnId) {
                throw new Error('Thiếu ID món ăn');
            }

            const result = await this.db.query(
                'DELETE FROM chi_tiet_thuc_don WHERE thuc_don_id = ? AND mon_an_id = ?',
                [menuId, monAnId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Không tìm thấy món ăn trong thực đơn');
            }
            return await this.getMenuWithDetails(menuId);

        } catch (error) {
            console.error('Error removing dish from menu:', error);
            throw new Error('Lỗi khi xóa món khỏi thực đơn: ' + error.message);
        }
    }

    /**
     * Cập nhật chỉ thông tin cơ bản của thực đơn (không động đến chi tiết món ăn)
     */
    async updateMenuBasicInfo(menuId, updateData) {
        try {
            const {
                ten_thuc_don,
                ngay_ap_dung,
                loai_bua_an,
                nhom_lop,
                so_tre_du_kien,
                trang_thai,
                ghi_chu
            } = updateData;

            // Cập nhật chỉ thông tin thực đơn chính
            const fields = [];
            const values = [];

            if (ten_thuc_don !== undefined && ten_thuc_don !== null) {
                fields.push('ten_thuc_don = ?');
                values.push(ten_thuc_don);
            }
            if (ngay_ap_dung !== undefined && ngay_ap_dung !== null) {
                fields.push('ngay_ap_dung = ?');
                values.push(ngay_ap_dung);
            }
            if (loai_bua_an !== undefined && loai_bua_an !== null) {
                fields.push('loai_bua_an = ?');
                values.push(loai_bua_an);
            }
            if (nhom_lop !== undefined && nhom_lop !== null) {
                fields.push('nhom_lop = ?');
                values.push(nhom_lop);
            }
            if (so_tre_du_kien !== undefined && so_tre_du_kien !== null) {
                fields.push('so_tre_du_kien = ?');
                values.push(so_tre_du_kien);
            }
            if (trang_thai !== undefined && trang_thai !== null) {
                fields.push('trang_thai = ?');
                values.push(trang_thai);
            }
            if (ghi_chu !== undefined) {
                fields.push('ghi_chu = ?');
                values.push(ghi_chu || '');
            }

            if (fields.length === 0) {
                throw new Error('Không có dữ liệu để cập nhật');
            }

            values.push(menuId);
            const query = `UPDATE thuc_don SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
            
            await this.db.query(query, values);
            return await this.getMenuWithDetails(menuId);

        } catch (error) {
            console.error('Error updating menu basic info:', error);
            throw new Error('Lỗi khi cập nhật thông tin thực đơn: ' + error.message);
        }
    }

    /**
     * Xóa thực đơn với chi tiết món ăn
     */
    async deleteMenuWithDetails(menuId) {
        try {
            // Kiểm tra xem thực đơn có tồn tại không
            const menu = await this.db.query('SELECT * FROM thuc_don WHERE id = ?', [menuId]);
            if (!menu || menu.length === 0) {
                throw new Error('Không tìm thấy thực đơn để xóa');
            }

            // Xóa chi tiết món ăn trước (vì có foreign key constraint)
            await this.db.query('DELETE FROM chi_tiet_thuc_don WHERE thuc_don_id = ?', [menuId]);

            // Xóa thực đơn chính
            await this.db.query('DELETE FROM thuc_don WHERE id = ?', [menuId]);

            return {
                id: menuId,
                message: 'Xóa thực đơn thành công'
            };

        } catch (error) {
            console.error('Error deleting menu with details:', error);
            throw new Error('Lỗi khi xóa thực đơn: ' + error.message);
        }
    }

    /**
     * Tạo thực đơn mới
     */
    async create(mealData) {
        try {
            const { v4: uuidv4 } = require('uuid');
            const mealId = uuidv4();
            
            const {
                ten_thuc_don,
                ngay_ap_dung,
                loai_bua_an, // 'breakfast', 'lunch', 'dinner', 'snack'
                lop_ap_dung,
                so_tre_du_kien = 30,
                trang_thai = 'draft',
                created_by,
                ghi_chu = ''
            } = mealData;

            // Validation
            if (!ten_thuc_don || !ngay_ap_dung || !loai_bua_an) {
                throw new Error('Thiếu thông tin bắt buộc: tên thực đơn, ngày áp dụng, loại bữa ăn');
            }

            const query = `
                INSERT INTO thuc_don (
                    id, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                    lop_ap_dung, so_tre_du_kien, trang_thai,
                    created_by, ghi_chu, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const values = [
                mealId, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                lop_ap_dung, so_tre_du_kien, trang_thai,
                created_by, ghi_chu
            ];

            await this.db.query(query, values);
            return await this.findById(mealId);

        } catch (error) {
            console.error('Error creating meal:', error);
            throw new Error('Lỗi khi tạo thực đơn: ' + error.message);
        }
    }

    /**
     * Lấy tất cả thực đơn với pagination
     */
    async findAll(limit = 50, offset = 0) {
        try {
            const query = `
                SELECT 
                    td.*,
                    GROUP_CONCAT(
                        CONCAT(ma.ten_mon_an, ' (', ctd.so_khau_phan, ' khẩu phần)')
                        SEPARATOR ', '
                    ) as danh_sach_mon_an
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                GROUP BY td.id
                ORDER BY td.ngay_ap_dung DESC, td.loai_bua_an ASC
                LIMIT ? OFFSET ?
            `;

            const meals = await this.db.query(query, [limit, offset]);
            return meals || [];

        } catch (error) {
            console.error('Error finding all meals:', error);
            throw new Error('Lỗi khi lấy danh sách thực đơn: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ID
     */
    async findById(id) {
        try {
            const query = `
                SELECT 
                    td.*,
                    GROUP_CONCAT(
                        CONCAT(ma.ten_mon_an, ' (', ctd.so_khau_phan, ' khẩu phần)')
                        SEPARATOR ', '
                    ) as danh_sach_mon_an
                FROM thuc_don td
                LEFT JOIN chi_tiet_thuc_don ctd ON td.id = ctd.thuc_don_id
                LEFT JOIN mon_an ma ON ctd.mon_an_id = ma.id
                WHERE td.id = ?
                GROUP BY td.id
            `;

            const meals = await this.db.query(query, [id]);
            return meals && meals.length > 0 ? meals[0] : null;

        } catch (error) {
            console.error('Error finding meal by ID:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ID: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ngày
     */
    async findByDate(date) {
        try {
            const query = `
                SELECT 
                    id, ten_thuc_don, ngay_ap_dung, loai_bua_an,
                    lop_ap_dung, so_tre_du_kien, trang_thai,
                    created_by, ghi_chu, created_at, updated_at
                FROM thuc_don 
                WHERE DATE(ngay_ap_dung) = ?
                ORDER BY loai_bua_an, created_at
            `;
            
            const results = await this.db.query(query, [date]);
            return results;
        } catch (error) {
            console.error('Error finding meals by date:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ngày: ' + error.message);
        }
    }

    /**
     * Lấy thực đơn theo ngày và lớp
     */
    async findByDateAndClass(date, classId = null) {
        try {
            let query = `
                SELECT 
                    td.*,
                    ma.ten_mon, ma.mo_ta, ma.calories_per_serving,
                    ma.protein_per_serving, ma.carbs_per_serving,
                    ma.fat_per_serving, ma.image_url,
                    lh.ten_lop
                FROM thuc_don td
                LEFT JOIN mon_an ma ON td.mon_an_id = ma.id
                LEFT JOIN lop_hoc lh ON td.lop_hoc_id = lh.id
                WHERE td.ngay = ?
            `;
            const values = [date];

            if (classId) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(classId);
            }

            query += ' ORDER BY td.buoi_an, td.created_at';

            const meals = await this.db.query(query, values);
            
            // Nhóm theo buổi ăn
            const groupedMeals = this.groupMealsBySession(meals);
            
            return groupedMeals;

        } catch (error) {
            console.error('Error finding meals by date:', error);
            throw new Error('Lỗi khi lấy thực đơn theo ngày');
        }
    }

    /**
     * Nhóm bữa ăn theo buổi
     */
    groupMealsBySession(meals) {
        const grouped = {
            sang: [],
            trua: [],
            chieu: [],
            phu: []
        };

        meals.forEach(meal => {
            if (grouped[meal.buoi_an]) {
                grouped[meal.buoi_an].push(meal);
            }
        });

        return grouped;
    }

    /**
     * Lấy thực đơn theo tuần
     */
    async findByWeek(startDate, endDate, classId = null) {
        try {
            let query = `
                SELECT 
                    td.*,
                    ma.ten_mon, ma.mo_ta, ma.calories_per_serving,
                    ma.protein_per_serving, ma.carbs_per_serving,
                    ma.fat_per_serving, ma.image_url,
                    lh.ten_lop
                FROM thuc_don td
                LEFT JOIN mon_an ma ON td.mon_an_id = ma.id
                LEFT JOIN lop_hoc lh ON td.lop_hoc_id = lh.id
                WHERE td.ngay BETWEEN ? AND ?
            `;
            const values = [startDate, endDate];

            if (classId) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(classId);
            }

            query += ' ORDER BY td.ngay, td.buoi_an';

            return await this.db.query(query, values);

        } catch (error) {
            console.error('Error finding meals by week:', error);
            throw new Error('Lỗi khi lấy thực đơn theo tuần');
        }
    }

    /**
     * Tạo thực đơn cho cả tuần
     */
    async createWeeklyMenu(weeklyMenuData) {
        try {
            const { start_date, class_id, meals, created_by } = weeklyMenuData;
            const results = [];

            // Transaction để đảm bảo tính nhất quán
            await this.db.beginTransaction();

            try {
                for (const meal of meals) {
                    const mealData = {
                        ngay: meal.date,
                        buoi_an: meal.session,
                        mon_an_id: meal.food_id,
                        lop_hoc_id: class_id,
                        so_luong_phuc_vu: meal.serving_count || 30,
                        ghi_chu: meal.notes || '',
                        chi_phi_du_kien: meal.estimated_cost || 0,
                        created_by
                    };

                    const result = await this.create(mealData);
                    results.push(result);
                }

                await this.db.commit();
                return results;

            } catch (error) {
                await this.db.rollback();
                throw error;
            }

        } catch (error) {
            console.error('Error creating weekly menu:', error);
            throw new Error('Lỗi khi tạo thực đơn tuần');
        }
    }

    /**
     * Lấy thống kê dinh dưỡng của thực đơn
     */
    async getNutritionSummary(date, classId = null) {
        try {
            let query = `
                SELECT 
                    td.buoi_an,
                    SUM(ma.calories_per_serving * td.so_luong_phuc_vu) as total_calories,
                    SUM(ma.protein_per_serving * td.so_luong_phuc_vu) as total_protein,
                    SUM(ma.carbs_per_serving * td.so_luong_phuc_vu) as total_carbs,
                    SUM(ma.fat_per_serving * td.so_luong_phuc_vu) as total_fat,
                    SUM(td.chi_phi_du_kien) as total_cost,
                    COUNT(*) as meal_count
                FROM thuc_don td
                JOIN mon_an ma ON td.mon_an_id = ma.id
                WHERE td.ngay = ?
            `;
            const values = [date];

            if (classId) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(classId);
            }

            query += ' GROUP BY td.buoi_an ORDER BY td.buoi_an';

            const sessionStats = await this.db.query(query, values);

            // Tính tổng cho cả ngày
            const dailyTotal = sessionStats.reduce((total, session) => ({
                total_calories: total.total_calories + (session.total_calories || 0),
                total_protein: total.total_protein + (session.total_protein || 0),
                total_carbs: total.total_carbs + (session.total_carbs || 0),
                total_fat: total.total_fat + (session.total_fat || 0),
                total_cost: total.total_cost + (session.total_cost || 0),
                meal_count: total.meal_count + session.meal_count
            }), {
                total_calories: 0,
                total_protein: 0,
                total_carbs: 0,
                total_fat: 0,
                total_cost: 0,
                meal_count: 0
            });

            return {
                date,
                class_id: classId,
                sessions: sessionStats,
                daily_total: dailyTotal
            };

        } catch (error) {
            console.error('Error getting nutrition summary:', error);
            throw new Error('Lỗi khi lấy tóm tắt dinh dưỡng');
        }
    }

    /**
     * Cập nhật thực đơn
     */
    async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('Không có dữ liệu để cập nhật');
            }

            values.push(id);
            const query = `UPDATE thuc_don SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
            
            await this.db.query(query, values);
            return await this.findById(id);

        } catch (error) {
            console.error('Error updating meal:', error);
            throw new Error('Lỗi khi cập nhật thực đơn');
        }
    }

    /**
     * Xóa thực đơn
     */
    async delete(id) {
        try {
            await this.db.query('DELETE FROM thuc_don WHERE id = ?', [id]);
            return true;

        } catch (error) {
            console.error('Error deleting meal:', error);
            throw new Error('Lỗi khi xóa thực đơn');
        }
    }

    /**
     * Lấy lịch sử thực đơn
     */
    async getHistory(filters = {}) {
        try {
            let query = `
                SELECT 
                    td.*,
                    ma.ten_mon,
                    lh.ten_lop,
                    u.ten_dang_nhap as created_by_name
                FROM thuc_don td
                LEFT JOIN mon_an ma ON td.mon_an_id = ma.id
                LEFT JOIN lop_hoc lh ON td.lop_hoc_id = lh.id
                LEFT JOIN users u ON td.created_by = u.id
                WHERE 1=1
            `;
            const values = [];

            if (filters.start_date) {
                query += ' AND td.ngay >= ?';
                values.push(filters.start_date);
            }

            if (filters.end_date) {
                query += ' AND td.ngay <= ?';
                values.push(filters.end_date);
            }

            if (filters.class_id) {
                query += ' AND td.lop_hoc_id = ?';
                values.push(filters.class_id);
            }

            query += ' ORDER BY td.ngay DESC, td.buoi_an';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));
            }

            return await this.db.query(query, values);

        } catch (error) {
            console.error('Error getting meal history:', error);
            throw new Error('Lỗi khi lấy lịch sử thực đơn');
        }
    }

    /**
     * Lấy thực đơn theo ngày cho API
     * Được gọi từ controller getMealsByDateForAPI
     */
    async getMealsByDateForAPI(date, nhom = null, classId = null) {
        try {  
            // Sử dụng method getMenuByDateWithDetails có sẵn, bỏ tham số nhom để tránh lọc sai
            const menuData = await this.getMenuByDateWithDetails(date, nhom);

            if (!menuData || Object.keys(menuData).length === 0) {
                console.warn("Không có dữ liệu menuData cho ngày:", date);
                return [];
            }
            return menuData;

        } catch (error) {
            console.error('Error in getMealsByDateForAPI:', error);
            throw new Error('Không tìm thấy thực đơn');
        }
    }
}

module.exports = Meal;