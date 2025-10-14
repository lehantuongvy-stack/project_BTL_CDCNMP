import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import apiService from '../../services/api.js';
import './UserManagement.css';

const UserManagement = ({ role, title }) => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    phone: '',
    email: ''
  });

  // For inline editing
  const [editingCell, setEditingCell] = useState({ userId: null, field: null });
  const [editingValues, setEditingValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [role]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/users?role=${role}`);

      if (response.success) {
        const usersData = response.data?.users || [];

        // Ensure we always set an array
        const usersArray = Array.isArray(usersData) ? usersData : [];
        setUsers(usersArray);
        console.log(' Final users state:', usersArray);
      } else {
        console.error(' API response not successful:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search criteria
  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch = !filters.searchTerm || 
      user.full_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesPhone = !filters.phone || user.phone?.includes(filters.phone);
    const matchesEmail = !filters.email || user.email?.includes(filters.email);

    return matchesSearch && matchesPhone && matchesEmail;
  });

  // Handle inline edit start
  const handleCellClick = (userId, field, currentValue) => {
    setEditingCell({ userId, field });
    setEditingValues({ [`${userId}_${field}`]: currentValue || '' });
    setOriginalValues({ [`${userId}_${field}`]: currentValue || '' });
  };

  // Handle input change during inline edit
  const handleInlineInputChange = (userId, field, value) => {
    setEditingValues(prev => ({
      ...prev,
      [`${userId}_${field}`]: value
    }));
  };

  // Handle save inline edit
  const handleInlineSave = async (userId, field) => {
    const key = `${userId}_${field}`;
    const newValue = editingValues[key];
    
    try {
      setLoading(true);
      
      // Prepare update data - only send the field being updated
      const updateData = {
        [field]: newValue
      };

      const response = await apiService.put(`/api/users/${userId}`, updateData);
      
      if (response.success) {
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, [field]: newValue }
            : u
        ));
        
        // Clear editing state
        setEditingCell({ userId: null, field: null });
        setEditingValues({});
        setOriginalValues({});
        
        console.log('Cập nhật thành công!');
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Cập nhật thất bại: ' + (error.message || 'Unknown error'));
      
      // Restore original value
      const originalKey = `${userId}_${field}`;
      setEditingValues(prev => ({
        ...prev,
        [key]: originalValues[originalKey]
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel inline edit
  const handleInlineCancel = (userId, field) => {
    const key = `${userId}_${field}`;
    const originalKey = `${userId}_${field}`;
    
    // Restore original value
    setEditingValues(prev => ({
      ...prev,
      [key]: originalValues[originalKey]
    }));
    
    // Clear editing state
    setEditingCell({ userId: null, field: null });
    setEditingValues({});
    setOriginalValues({});
  };

  // Handle Enter key press
  const handleKeyPress = (e, userId, field) => {
    if (e.key === 'Enter') {
      handleInlineSave(userId, field);
    } else if (e.key === 'Escape') {
      handleInlineCancel(userId, field);
    }
  };

  // Handle delete user
  const handleDelete = async (user) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${user.full_name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.delete(`/api/users/${user.id}`);
      
      if (response.success) {
        alert('Xóa thành công!');
        loadUsers(); // Reload list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa: ' + (error.message || 'Unknown error'));
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
  const renderEditableCell = (user, field, displayValue) => {
    const isEditing = editingCell.userId === user.id && editingCell.field === field;
    const key = `${user.id}_${field}`;
    
    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <input
            type="text"
            value={editingValues[key] || ''}
            onChange={(e) => handleInlineInputChange(user.id, field, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, user.id, field)}
            onBlur={() => handleInlineSave(user.id, field)}
            className="inline-edit-input"
            autoFocus
          />
          <div className="inline-edit-actions">
            <button 
              onClick={() => handleInlineSave(user.id, field)}
              className="inline-save-btn"
              disabled={loading}
            >
              V
            </button>
            <button 
              onClick={() => handleInlineCancel(user.id, field)}
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
        onClick={() => handleCellClick(user.id, field, displayValue)}
        title="Click để chỉnh sửa"
      >
        {displayValue || 'Chưa cập nhật'}
      </div>
    );
  };

  // Render status cell
  const renderStatusCell = (user) => {
    const isEditing = editingCell.userId === user.id && editingCell.field === 'is_active';
    const key = `${user.id}_is_active`;
    
    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <select
            value={editingValues[key]}
            onChange={(e) => handleInlineInputChange(user.id, 'is_active', e.target.value)}
            onBlur={() => handleInlineSave(user.id, 'is_active')}
            className="inline-edit-select"
            autoFocus
          >
            <option value="1">Hoạt động</option>
            <option value="0">Tạm khóa</option>
          </select>
          <div className="inline-edit-actions">
            <button 
              onClick={() => handleInlineSave(user.id, 'is_active')}
              className="inline-save-btn"
              disabled={loading}
            >
              V
            </button>
            <button 
              onClick={() => handleInlineCancel(user.id, 'is_active')}
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
        onClick={() => handleCellClick(user.id, 'is_active', user.is_active)}
        title="Click để chỉnh sửa"
      >
        <span className={`status-badge ${user.is_active == 1 ? 'active' : 'inactive'}`}>
          {user.is_active == 1 ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      </div>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management-container">
        <div className="loading-message">
          <p>Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="section-header">
        <h2>{title}</h2>
        <p>Tìm kiếm và quản lý thông tin tài khoản trong hệ thống</p>
      </div>

      {/* Search Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo tên, username, email..."
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
        <p>Tìm thấy {filteredUsers.length} người dùng</p>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-results">
            <p>Không tìm thấy người dùng nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>HỌ VÀ TÊN</th>
                <th>EMAIL</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>ĐỊA CHỈ</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY TẠO</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{renderEditableCell(user, 'username', user.username)}</td>
                  <td>{renderEditableCell(user, 'full_name', user.full_name)}</td>
                  <td>{renderEditableCell(user, 'email', user.email)}</td>
                  <td>{renderEditableCell(user, 'phone', user.phone)}</td>
                  <td>{renderEditableCell(user, 'address', user.address)}</td>
                  <td>{renderStatusCell(user)}</td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleDelete(user)}
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

export default UserManagement;
