class ParentFeedback {
  constructor(db) {
    this.db = db;
  }

  async create(data) {
    return await this.db.createYKienPhuHuynh(data);
  }

  async findAll(filters = {}) {
    return await this.db.getYKienPhuHuynh(filters);
  }
}

module.exports = ParentFeedback;
