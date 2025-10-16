import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/AccountInfo.css';
import BackButton from "../components/BackButton";

const AccountInfo = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null); 

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !token) {
        console.log(' User or token not available yet');
        return;
      }

      try {
        console.log(' Current user from AuthContext:', user);
        
        // Fetch detailed user info
        const res = await fetch(`http://localhost:3002/api/users/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log('📦 User data from API:', data);

        if (data.success && data.data && data.data.user) {
          const userData = data.data.user;
          setCurrentUser(userData);
          setFormData({
            full_name: userData.full_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
        } else {
          console.error(' API response không thành công:', data);
          setErrors({ fetch: 'Không thể tải thông tin người dùng' });
        }
      } catch (error) {
        console.error(" Lỗi khi lấy dữ liệu user:", error);
        setErrors({ fetch: 'Không thể kết nối đến server' });
      }
    };

    fetchUserData();
  }, [user, token]); // Depend on user and token from AuthContext


//   // Initialize form data when user data is available
//   useEffect(() => {
//     if (user) {
//       setFormData({
//         full_name: user.full_name || '',
//         email: user.email || '',
//         phone_number: user.phone_number || '',
//       });
//     }
//   }, [user]);

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
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password validation
  const validatePassword = () => {
    const newErrors = {};

    // Current password validation
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'Mật khẩu hiện tại không được để trống';
    }

    // New password validation
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (!/^[0-9]{6,}$/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 chữ số';
    } else if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    // Confirm password validation
    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu nhập lại không trùng khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
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

  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');
      setErrors({});
      
      // Use user ID from AuthContext instead of making API call
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('Không thể xác định người dùng');
      }
      
      const response = await fetch(`http://localhost:3002/api/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword,
          password: passwordData.newPassword 
        }),
      });

      const data = await response.json();
      console.log(' Password update response:', data);

      if (data.success) {
        setSuccessMessage('Đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
      }
      
    } catch (error) {
      console.error(' Password update failed:', error);
      setErrors({ passwordSubmit: error.message || 'Có lỗi xảy ra khi đổi mật khẩu' });
    } finally {
      setLoading(false);
    }
  };

  // Cancel password change
  const handlePasswordCancel = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
    setErrors({});
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
      
      // Use user ID from AuthContext instead of making API call
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('Không thể xác định người dùng');
      }
      
      const response = await fetch(`http://localhost:3002/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(' Update response:', data);

      if (data.success && data.data && data.data.user) {
        // Update form data with returned data
        const userData = data.data.user;
        setFormData({
          full_name: userData.full_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });
        
        setSuccessMessage('Cập nhật thông tin thành công!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Cập nhật thất bại');
      }
      
    } catch (error) {
      console.error(' Update profile failed:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi cập nhật thông tin' });
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Reload original data from API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        // Get current user ID first
        const currentUserRes = await fetch(`http://localhost:3002/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        const currentUserData = await currentUserRes.json();
        if (!currentUserData.success) return;
        
        const userId = currentUserData.data.id;
        
        const res = await fetch(`http://localhost:3002/api/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success && data.data && data.data.user) {
          const userData = data.data.user;
          setCurrentUser(userData);
          setFormData({
            full_name: userData.full_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
        }
      } catch (error) {
        console.error(" Lỗi khi tải lại dữ liệu:", error);
      }
    };
    
    fetchUserData();
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

  if (!currentUser) {
    return (
      <div className="account-info-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="account-info">
      <BackButton />
      <div className="account-container">
        <div className="account-header">
          <h2>Thông tin tài khoản</h2>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {successMessage}
          </div>
        )}

        {errors.fetch && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {errors.fetch}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {errors.submit}
          </div>
        )}

        {errors.passwordSubmit && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {errors.passwordSubmit}
          </div>
        )}

        <div className="account-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {getAvatarText(currentUser.full_name)}
            </div>
            <div className="profile-basic-info">
              <h3>{currentUser.full_name || currentUser.username}</h3>
              <span 
                className="role-badge" 
                style={{ backgroundColor: getRoleColor(currentUser.role) }}
              >
                {getRoleDisplayName(currentUser.role)}
              </span>
              <p className="username">@{currentUser.username}</p>
            </div>
            <div className="profile-actions">
              {!isEditing && !isChangingPassword ? (
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              ) : isEditing ? (
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
              ) : (
                <div className="edit-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={handlePasswordCancel}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={handlePasswordSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Form */}
          {isChangingPassword && (
            <div className="password-change-form">
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Mật khẩu mới *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    placeholder="Nhập mật khẩu mới (chỉ số, tối thiểu 6 chữ số)"
                  />
                  {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Nhập lại mật khẩu *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </form>
            </div>
          )}

          {/* Profile Details */}
          {!isChangingPassword && (
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
                    {formData.full_name || 'Chưa cập nhật'}
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
                    {formData.email || 'Chưa cập nhật'}
                  </div>
                )}
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="form-display">
                    {formData.phone || 'Chưa cập nhật'}
                  </div>
                )}
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                {isEditing ? (
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    placeholder="Nhập địa chỉ"
                    rows="3"
                  />
                ) : (
                  <div className="form-display">
                    {formData.address || 'Chưa cập nhật'}
                  </div>
                )}
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Tên đăng nhập</label>
                <div className="form-display readonly">
                  {currentUser.username}
                </div>
                <small className="form-text">Tên đăng nhập không thể thay đổi</small>
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <div className="form-display readonly">
                  <span 
                    className="role-badge-small" 
                    style={{ backgroundColor: getRoleColor(currentUser.role) }}
                  >
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                </div>
                <small className="form-text">Vai trò được phân quyền bởi quản trị viên</small>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;