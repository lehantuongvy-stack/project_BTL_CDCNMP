// services/WarehouseService.js
class WarehouseService {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    return await this.db.query('SELECT * FROM kho_hang ORDER BY ngay_cap_nhat DESC');
  }

  async getById(id) {
    const rows = await this.db.query('SELECT * FROM kho_hang WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async delete(id) {
    return await this.db.query('DELETE FROM kho_hang WHERE id = ?', [id]);
  }
}

module.exports = WarehouseService;
