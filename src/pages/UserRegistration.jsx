import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/UserRegistration.css';

const UserRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    phone_number: '',
    role: 'parent' // default to parent
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Debug auth info
  React.useEffect(() => {
    console.log('🔍 UserRegistration - Current user:', user);
    console.log('🔍 UserRegistration - Auth token:', localStorage.getItem('authToken'));
    console.log('🔍 UserRegistration - User from storage:', localStorage.getItem('user'));
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

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

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

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Vui lòng chọn vai trò';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('👤 Current user role:', user?.role);
    console.log('🔑 Auth token exists:', !!localStorage.getItem('authToken'));
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      setErrors({ general: 'Chỉ admin mới có thể tạo tài khoản' });
      console.error('❌ Access denied: Not admin');
      return;
    }
    
    if (!validateForm()) {
      console.error('❌ Form validation failed');
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');
      setErrors({});
      
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      
      console.log('📤 Sending registration data:', registerData);
      
      const response = await authService.register(registerData);
      
      console.log('✅ Registration successful:', response);
      
      if (response.success) {
        setSuccessMessage(`Tạo tài khoản ${formData.role === 'teacher' ? 'giáo viên' : 'phụ huynh'} thành công!`);
        
        // Reset form
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          email: '',
          phone_number: '',
          role: 'parent'
        });
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi tạo tài khoản' });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Không có quyền truy cập</h2>
        <p>Chỉ admin mới có thể tạo tài khoản mới.</p>
        <button onClick={() => navigate('/admin')} className="btn btn-primary">
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="user-registration">
      <div className="registration-container">
        <div className="registration-header">
          <h2>🆕 Tạo tài khoản mới</h2>
          <p>Tạo tài khoản cho giáo viên hoặc phụ huynh</p>
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

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Vai trò *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`form-control ${errors.role ? 'is-invalid' : ''}`}
            >
              <option value="parent">👨‍👩‍👧‍👦 Phụ huynh</option>
              <option value="teacher">👩‍🏫 Giáo viên</option>
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="full_name">Họ và tên *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
              placeholder="Nhập họ và tên đầy đủ"
            />
            {errors.full_name && <span className="error-message">{errors.full_name}</span>}
          </div>

          {/* Password */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Nhập mật khẩu"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Nhập địa chỉ email (không bắt buộc)"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone_number">Số điện thoại</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
              placeholder="Nhập số điện thoại (không bắt buộc)"
            />
            {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn btn-secondary"
              disabled={loading}
            >
              ← Quay lại
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang tạo...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Tạo tài khoản
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;