class ParentFeedbackService {
  constructor(db) {
    this.db = db;
  }

  async createFeedback(data) {
    return await this.db.createYKienPhuHuynh(data);
  }

  async getFeedbackByParent(parent_id) {
    return await this.db.getYKienPhuHuynh({ parent_id });
  }

  async getAllFeedback() {
    return await this.db.getYKienPhuHuynh();
  }
}

module.exports = ParentFeedbackService;
