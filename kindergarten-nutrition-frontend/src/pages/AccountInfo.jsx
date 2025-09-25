import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AccountInfo.css';

const AccountInfo = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ và tên là bắt buộc';
    }

    // Email validation (optional but if provided must be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone validation (optional but if provided must be valid)
    if (formData.phone_number && !/^[0-9]{10,11}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại phải có 10-11 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit (update profile)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');
      setErrors({});
      
      // TODO: Call API to update user profile
      // const response = await userService.updateProfile(formData);
      
      // For now, just update local data
      const updatedUser = { ...user, ...formData };
      updateUser(updatedUser);
      
      setSuccessMessage('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Update profile failed:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi cập nhật thông tin' });
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
    });
    setIsEditing(false);
    setErrors({});
  };

  // Get avatar text
  const getAvatarText = (fullName) => {
    if (!fullName) return 'U';
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
    }
    return fullName.charAt(0);
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giáo viên';
      case 'parent': return 'Phụ huynh';
      default: return 'Người dùng';
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'teacher': return '#28a745';
      case 'parent': return '#007bff';
      default: return '#6c757d';
    }
  };

  if (!user) {
    return (
      <div className="account-info-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="account-info">
      <div className="account-container">
        <div className="account-header">
          <h2> Thông tin tài khoản</h2>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {errors.submit}
          </div>
        )}

        <div className="account-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {getAvatarText(user.full_name)}
            </div>
            <div className="profile-basic-info">
              <h3>{user.full_name || user.username}</h3>
              <span 
                className="role-badge" 
                style={{ backgroundColor: getRoleColor(user.role) }}
              >
                {getRoleDisplayName(user.role)}
              </span>
              <p className="username">@{user.username}</p>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                   Chỉnh sửa
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="full_name">Họ và tên *</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                ) : (
                  <div className="form-display">
                    {user.full_name || 'Chưa cập nhật'}
                  </div>
                )}
                {errors.full_name && <span className="error-message">{errors.full_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Nhập địa chỉ email"
                  />
                ) : (
                  <div className="form-display">
                    {user.email || 'Chưa cập nhật'}
                  </div>
                )}
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="form-display">
                    {user.phone_number || 'Chưa cập nhật'}
                  </div>
                )}
                {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
              </div>

              <div className="form-group">
                <label>Tên đăng nhập</label>
                <div className="form-display readonly">
                  {user.username}
                </div>
                <small className="form-text">Tên đăng nhập không thể thay đổi</small>
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <div className="form-display readonly">
                  <span 
                    className="role-badge-small" 
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <small className="form-text">Vai trò được phân quyền bởi quản trị viên</small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;