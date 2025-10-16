import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import apiService from '../../services/api.js';
import classService from '../../services/classService.js';
import './TeacherManagement.css';

const TeacherManagement = () => {
  const { user, token } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    phone: '',
    email: ''
  });

  // For inline editing
  const [editingCell, setEditingCell] = useState({ teacherId: null, field: null });
  const [editingValues, setEditingValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});

  // Load teachers and classes on component mount
  useEffect(() => {
    loadTeachers();
    loadClasses();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/users?role=teacher');
      
      console.log(' Full API response:', response);
      console.log(' Response data:', response.data);
      console.log(' Response data users:', response.data?.users);
      console.log(' Users is array?', Array.isArray(response.data?.users));
      
      if (response.success) {
        const users = response.data?.users || [];
        console.log(' Setting teachers to:', users);
        console.log(' Users is array?', Array.isArray(users));
        console.log(' Users length:', users.length);
        console.log(' First user:', users[0]);
        
        // Ensure we always set an array
        const teachersArray = Array.isArray(users) ? users : [];
        setTeachers(teachersArray);
        console.log(' Final teachers state:', teachersArray);
      } else {
        console.error(' API response not successful:', response);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      // Sử dụng danh sách lớp cố định như yêu cầu
      setClasses([
        { id: '771fc0e3-a4ec-11f0-8498-a036bc312358', name: 'Mầm' },
        { id: '1a9a342f-98a3-11f0-9a5b-a036bc312358', name: 'Lá' },
        { id: '771fdaee-a4ec-11f0-8498-a036bc312358', name: 'Chồi' },
        { id: '1a9a3487-98a3-11f0-9a5b-a036bc312358', name: 'Hoa' }
      ]);
    } catch (error) {
      console.error('Error loading classes:', error);
      // Fallback to same hardcoded classes
      setClasses([
        { id: '771fc0e3-a4ec-11f0-8498-a036bc312358', name: 'Mầm' },
        { id: '1a9a342f-98a3-11f0-9a5b-a036bc312358', name: 'Lá' },
        { id: '771fdaee-a4ec-11f0-8498-a036bc312358', name: 'Chồi' },
        { id: '1a9a3487-98a3-11f0-9a5b-a036bc312358', name: 'Hoa' }
      ]);
    }
  };

  // Filter teachers based on search criteria
  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(teacher => {
    const matchesSearch = !filters.searchTerm || 
      teacher.full_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      teacher.username?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesPhone = !filters.phone || teacher.phone?.includes(filters.phone);
    const matchesEmail = !filters.email || teacher.email?.includes(filters.email);

    return matchesSearch && matchesPhone && matchesEmail;
  });

  // Debug filtered results
  console.log(' Teachers array:', teachers);
  console.log(' Teachers length:', teachers?.length);
  console.log(' Filtered teachers:', filteredTeachers);
  console.log(' Filtered teachers length:', filteredTeachers?.length);

  // Handle inline edit start
  const handleCellClick = (teacherId, field, currentValue) => {
    setEditingCell({ teacherId, field });
    setEditingValues({ [`${teacherId}_${field}`]: currentValue || '' });
    setOriginalValues({ [`${teacherId}_${field}`]: currentValue || '' });
  };

  // Handle input change during inline edit
  const handleInlineInputChange = (teacherId, field, value) => {
    setEditingValues(prev => ({
      ...prev,
      [`${teacherId}_${field}`]: value
    }));
  };

  // Handle save inline edit
  const handleInlineSave = async (teacherId, field) => {
    const key = `${teacherId}_${field}`;
    const newValue = editingValues[key];
    
    try {
      setLoading(true);
      
      // Find the teacher to get current data
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) return;

      // Prepare update data - only send the field being updated
      const updateData = {
        [field]: field === 'class_id' && newValue === '' ? null : newValue
      };

      const response = await apiService.put(`/api/users/${teacherId}`, updateData);
      
      if (response.success) {
        // Update local state
        setTeachers(prev => prev.map(t => 
          t.id === teacherId 
            ? { ...t, [field]: newValue }
            : t
        ));
        
        // Clear editing state
        setEditingCell({ teacherId: null, field: null });
        setEditingValues({});
        setOriginalValues({});
        
        console.log('Cập nhật thành công!');
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Cập nhật thất bại: ' + (error.message || 'Unknown error'));
      
      // Restore original value
      const originalKey = `${teacherId}_${field}`;
      setEditingValues(prev => ({
        ...prev,
        [key]: originalValues[originalKey]
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel inline edit
  const handleInlineCancel = (teacherId, field) => {
    const key = `${teacherId}_${field}`;
    const originalKey = `${teacherId}_${field}`;
    
    // Restore original value
    setEditingValues(prev => ({
      ...prev,
      [key]: originalValues[originalKey]
    }));
    
    // Clear editing state
    setEditingCell({ teacherId: null, field: null });
    setEditingValues({});
    setOriginalValues({});
  };

  // Handle Enter key press
  const handleKeyPress = (e, teacherId, field) => {
    if (e.key === 'Enter') {
      handleInlineSave(teacherId, field);
    } else if (e.key === 'Escape') {
      handleInlineCancel(teacherId, field);
    }
  };

  // Handle delete teacher
  const handleDelete = async (teacher) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa giáo viên "${teacher.full_name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.delete(`/api/users/${teacher.id}`);
      
      if (response.success) {
        alert('Xóa giáo viên thành công!');
        loadTeachers(); // Reload list
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Lỗi khi xóa giáo viên: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      phone: '',
      email: ''
    });
  };

  // Render editable cell
  const renderEditableCell = (teacher, field, displayValue) => {
    const isEditing = editingCell.teacherId === teacher.id && editingCell.field === field;
    const key = `${teacher.id}_${field}`;
    
    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <input
            type="text"
            value={editingValues[key] || ''}
            onChange={(e) => handleInlineInputChange(teacher.id, field, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, teacher.id, field)}
            onBlur={() => handleInlineSave(teacher.id, field)}
            className="inline-edit-input"
            autoFocus
          />
          <div className="inline-edit-actions">
            <button 
              onClick={() => handleInlineSave(teacher.id, field)}
              className="inline-save-btn"
              disabled={loading}
            >
              V
            </button>
            <button 
              onClick={() => handleInlineCancel(teacher.id, field)}
              className="inline-cancel-btn"
            >
              X
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="editable-cell"
        onClick={() => handleCellClick(teacher.id, field, displayValue)}
        title="Click để chỉnh sửa"
      >
        {displayValue || 'Chưa cập nhật'}
      </div>
    );
  };

  // Render status cell
  const renderStatusCell = (teacher) => {
    const isEditing = editingCell.teacherId === teacher.id && editingCell.field === 'is_active';
    const key = `${teacher.id}_is_active`;
    
    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <select
            value={editingValues[key]}
            onChange={(e) => handleInlineInputChange(teacher.id, 'is_active', e.target.value)}
            onBlur={() => handleInlineSave(teacher.id, 'is_active')}
            className="inline-edit-select"
            autoFocus
          >
            <option value="1">Hoạt động</option>
            <option value="0">Tạm khóa</option>
          </select>
          <div className="inline-edit-actions">
            <button 
              onClick={() => handleInlineSave(teacher.id, 'is_active')}
              className="inline-save-btn"
              disabled={loading}
            >
              V
            </button>
            <button 
              onClick={() => handleInlineCancel(teacher.id, 'is_active')}
              className="inline-cancel-btn"
            >
              X
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="editable-cell status-cell"
        onClick={() => handleCellClick(teacher.id, 'is_active', teacher.is_active)}
        title="Click để chỉnh sửa"
      >
        <span className={`status-badge ${teacher.is_active == 1 ? 'active' : 'inactive'}`}>
          {teacher.is_active == 1 ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      </div>
    );
  };

  // Render class cell with inline editing
  const renderClassCell = (teacher) => {
    const isEditing = editingCell.teacherId === teacher.id && editingCell.field === 'class_id';
    const key = `${teacher.id}_class_id`;
    const currentClassId = teacher.class_id;
    const className = getClassName(currentClassId);
    
    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <select
            value={editingValues[key] || ''}
            onChange={(e) => handleInlineInputChange(teacher.id, 'class_id', e.target.value)}
            onBlur={() => handleInlineSave(teacher.id, 'class_id')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleInlineSave(teacher.id, 'class_id');
              if (e.key === 'Escape') handleInlineCancel(teacher.id, 'class_id');
            }}
            className="inline-edit-select"
            autoFocus
          >
            <option value="">-- Chọn lớp --</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                Lớp {classItem.name}
              </option>
            ))}
          </select>
          <div className="inline-edit-actions">
            <button 
              onClick={() => handleInlineSave(teacher.id, 'class_id')}
              className="inline-save-btn"
              disabled={loading}
            >
              V
            </button>
            <button 
              onClick={() => handleInlineCancel(teacher.id, 'class_id')}
              className="inline-cancel-btn"
            >
              X
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="editable-cell class-cell"
        onClick={() => handleCellClick(teacher.id, 'class_id', currentClassId)}
        title="Click để chỉnh sửa lớp"
      >
        {className || 'Chưa phân lớp'}
      </div>
    );
  };

  // Helper function to get class name from class_id
  const getClassName = (classId) => {
    if (!classId) return null;
    
    // Find class by ID from loaded classes
    const classItem = classes.find(cls => cls.id === classId);
    return classItem ? `Lớp ${classItem.name}` : classId;
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="teacher-management-container">
        <div className="loading-message">
          <p>Đang tải danh sách giáo viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-management-container">
      <div className="section-header">
        <h2>Quản lý giáo viên</h2>
        <p>Tìm kiếm và quản lý thông tin tài khoản giáo viên trong hệ thống</p>
      </div>

      {/* Search Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo tên, mã học sinh, email..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Số điện thoại</label>
          <input
            type="text"
            placeholder="Tìm theo SĐT..."
            value={filters.phone}
            onChange={(e) => handleFilterChange('phone', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Email</label>
          <input
            type="text"
            placeholder="Tìm theo email..."
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
            className="filter-input"
          />
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Xóa bộ lọc
        </button>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Tìm thấy {filteredTeachers.length} giáo viên</p>
      </div>

      {/* Teachers Table */}
      <div className="table-container">
        {filteredTeachers.length === 0 ? (
          <div className="no-results">
            <p>Không tìm thấy giáo viên nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <table className="teachers-table">
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>HỌ VÀ TÊN</th>
                <th>EMAIL</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>ĐỊA CHỈ</th>
                <th>LỚP</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY TẠO</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{renderEditableCell(teacher, 'username', teacher.username)}</td>
                  <td>{renderEditableCell(teacher, 'full_name', teacher.full_name)}</td>
                  <td>{renderEditableCell(teacher, 'email', teacher.email)}</td>
                  <td>{renderEditableCell(teacher, 'phone', teacher.phone)}</td>
                  <td>{renderEditableCell(teacher, 'address', teacher.address)}</td>
                  <td>{renderClassCell(teacher)}</td>
                  <td>{renderStatusCell(teacher)}</td>
                  <td>{teacher.created_at ? new Date(teacher.created_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleDelete(teacher)}
                        className="delete-btn"
                        disabled={loading}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


    </div>
  );
};

export default TeacherManagement;
