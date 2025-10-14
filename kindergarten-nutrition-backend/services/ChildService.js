const { v4: uuidv4 } = require('uuid');

class ChildService {
  constructor(db) {
    this.db = db;
  }

  async getAllChildren(userRole, parentId = null) {
    let query = `
      SELECT c.*, p.full_name as parent_name, p.email as parent_email, 
             p.phone as parent_phone, t.full_name as teacher_name
      FROM children c
      LEFT JOIN users p ON c.parent_id = p.id
      LEFT JOIN users t ON c.teacher_id = t.id
      WHERE c.is_active = true
    `;
    const params = [];

    if (userRole === 'parent' && parentId) {
      query += ' AND c.parent_id = ?';
      params.push(parentId);
    }

    query += ' ORDER BY c.full_name ASC';
    const children = await this.db.select(query, params);
    
    return {
      success: true, data: children, count: children.length,
      message: userRole === 'parent' ? 'Danh sách con em của bạn' : 'Danh sách trẻ em'
    };
  }

  async canAccessChildInfo(childId, userRole, parentId = null) {
    if (['admin', 'teacher', 'nutritionist'].includes(userRole)) {
      return { canAccess: true };
    }
    
    if (userRole === 'parent' && parentId) {
      const child = await this.db.findById('children', childId);
      return { 
        canAccess: child && child.parent_id === parentId,
        reason: child?.parent_id !== parentId ? 'Not your child' : 'Child not found'
      };
    }
    
    return { canAccess: false, reason: 'No permission' };
  }

  async createChild(childData) {
    const { studentId, fullName, dateOfBirth, gender, parentId, teacherId, className, allergies = [], medicalConditions = [], emergencyContact } = childData;
    
    if (!studentId || !fullName || !dateOfBirth || !gender) {
      return { success: false, message: 'Thiếu thông tin bắt buộc' };
    }

    const existingChild = await this.db.findWhere('children', { student_id: studentId });
    if (existingChild.length > 0) {
      return { success: false, message: 'Mã học sinh đã tồn tại' };
    }

    const newChild = {
      id: uuidv4(), student_id: studentId, full_name: fullName, date_of_birth: dateOfBirth,
      gender, parent_id: parentId || null, teacher_id: teacherId || null, class_name: className || null,
      allergies: JSON.stringify(allergies), medical_conditions: JSON.stringify(medicalConditions),
      emergency_contact: emergencyContact ? JSON.stringify(emergencyContact) : null,
      admission_date: new Date().toISOString().split('T')[0], is_active: true,
      created_at: new Date(), updated_at: new Date()
    };

    const result = await this.db.create('children', newChild);
    return result.affectedRows > 0 
      ? { success: true, message: 'Tạo hồ sơ trẻ em thành công', data: { id: newChild.id, student_id: studentId, full_name: fullName } }
      : { success: false, message: 'Tạo hồ sơ trẻ em thất bại' };
  }

  async getChildById(childId, userRole, parentId = null) {
    const accessCheck = await this.canAccessChildInfo(childId, userRole, parentId);
    if (!accessCheck.canAccess) {
      return { success: false, message: `Không có quyền truy cập: ${accessCheck.reason}` };
    }

    const children = await this.db.select(`
      SELECT c.*, p.full_name as parent_name, p.email as parent_email, p.phone as parent_phone,
             t.full_name as teacher_name, t.email as teacher_email
      FROM children c
      LEFT JOIN users p ON c.parent_id = p.id
      LEFT JOIN users t ON c.teacher_id = t.id
      WHERE c.id = ? AND c.is_active = true
    `, [childId]);

    if (children.length === 0) {
      return { success: false, message: 'Không tìm thấy thông tin trẻ em' };
    }

    const child = children[0];
    if (child.allergies) child.allergies = JSON.parse(child.allergies);
    if (child.medical_conditions) child.medical_conditions = JSON.parse(child.medical_conditions);
    if (child.emergency_contact) child.emergency_contact = JSON.parse(child.emergency_contact);

    return { success: true, data: child };
  }

  async updateChild(childId, updateData) {
    const allowedFields = ['full_name', 'class_name', 'teacher_id', 'allergies', 'medical_conditions', 'emergency_contact'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = ['allergies', 'medical_conditions', 'emergency_contact'].includes(field)
          ? JSON.stringify(updateData[field]) 
          : updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return { success: false, message: 'Không có dữ liệu để cập nhật' };
    }

    filteredData.updated_at = new Date();
    const result = await this.db.updateById('children', childId, filteredData);
    
    return result.affectedRows > 0 
      ? { success: true, message: 'Cập nhật thông tin trẻ em thành công' }
      : { success: false, message: 'Không tìm thấy trẻ em để cập nhật' };
  }

  async getChildrenByClass(className) {
    const children = await this.db.findWhere('children', { class_name: className, is_active: true }, 'full_name ASC');
    return { success: true, data: children, count: children.length };
  }

  async getChildrenByParent(parentId) {
    const children = await this.db.findWhere('children', { parent_id: parentId, is_active: true }, 'full_name ASC');
    return { success: true, data: children, count: children.length };
  }

  async searchChildren(searchTerm) {
    const children = await this.db.select(`
      SELECT c.*, p.full_name as parent_name, t.full_name as teacher_name
      FROM children c
      LEFT JOIN users p ON c.parent_id = p.id
      LEFT JOIN users t ON c.teacher_id = t.id
      WHERE c.is_active = true AND (c.full_name LIKE ? OR c.student_id LIKE ? OR c.class_name LIKE ?)
      ORDER BY c.full_name ASC
    `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

    return { success: true, data: children, count: children.length };
  }

  async getChildrenStats() {
    const stats = await this.db.select(`
      SELECT class_name, gender, COUNT(*) as count
      FROM children WHERE is_active = true
      GROUP BY class_name, gender ORDER BY class_name, gender
    `);
    
    const totalCount = await this.db.count('children', { is_active: true });
    return { success: true, data: { total: totalCount, breakdown: stats } };
  }
}

module.exports = ChildService;
