// models/Warehouse.js
const { v4: uuidv4 } = require('uuid');

class Warehouse {
  constructor(db) {
    this.db = db;
    this.table = 'kho_hang';
  }

  async getAll() {
    const sql = `SELECT * FROM ${this.table} ORDER BY ngay_cap_nhat DESC`;
    return await this.db.query(sql);
  }

  async getById(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id = ?`;
    const rows = await this.db.query(sql, [id]);
    return rows[0] || null;
  }

  async create(data) {
    const sql = `
      INSERT INTO ${this.table} 
      (nguyen_lieu, nguyen_lieu_ton, tinh_trang, suc_chua_toi_da, ngay_xuat, tong_so_luong)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.nguyen_lieu,
      data.nguyen_lieu_ton,
      data.tinh_trang || 'good',
      data.suc_chua_toi_da || 0,
      data.ngay_xuat || null,
      data.tong_so_luong || 0
    ];
    const result = await this.db.query(sql, params);
    return { insertId: result.insertId };
  }

  async update(id, data) {
    const sql = `
      UPDATE ${this.table}
      SET nguyen_lieu = ?, nguyen_lieu_ton = ?, tinh_trang = ?, 
          suc_chua_toi_da = ?, ngay_xuat = ?, tong_so_luong = ?, ngay_cap_nhat = NOW()
      WHERE id = ?
    `;
    const params = [
      data.nguyen_lieu,
      data.nguyen_lieu_ton,
      data.tinh_trang,
      data.suc_chua_toi_da,
      data.ngay_xuat,
      data.tong_so_luong,
      id
    ];
    return await this.db.query(sql, params);
  }

  async delete(id) {
    const sql = `DELETE FROM ${this.table} WHERE id = ?`;
    return await this.db.query(sql, [id]);
  }
}

module.exports = Warehouse;
