import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authService';
import '../styles/ParentRegistration.css';

const ParentRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registrationType = searchParams.get('type') || 'parent';
  
  console.log('🔧 ParentRegistration - URL params:', searchParams.get('type'));
  console.log('🔧 ParentRegistration - registrationType:', registrationType);
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  
  // User form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    role: registrationType,
    class_id: ''
  });

  useEffect(() => {
    // Check admin access
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Set role based on registration type
    setFormData(prev => ({
      ...prev,
      role: registrationType
    }));
    
    // Load classes for teacher registration
    if (registrationType === 'teacher') {
      loadClasses();
    }
  }, [user, navigate, registrationType]);

  const loadClasses = () => {
    // Classes với ID thực tế từ phpMyAdmin
    console.log('🔧 Setting hardcoded classes với ID chính xác...');
    setClasses([
      { id: '1a9a342f-98a3-11f0-9a5b-a036bc312358', name: 'Lá' },
      { id: '1a9a3487-98a3-11f0-9a5b-a036bc312358', name: 'Hoa' },
      { id: '771fc0e3-a4ec-11f0-8498-a036bc312358', name: 'Mầm' },
      { id: '771fdaee-a4ec-11f0-8498-a036bc312358', name: 'Chồi' }
    ]);
  };

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

    // User validation
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ và tên là bắt buộc';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.phone_number && !isValidPhone(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    }

    // Teacher validation
    if (registrationType === 'teacher') {
      if (!formData.class_id.trim()) {
        newErrors.class_id = 'Lớp phụ trách là bắt buộc';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation
  const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔧 Form submission started');
    console.log('🔧 Current user role:', user?.role);
    console.log('🔧 Auth token exists:', !!localStorage.getItem('authToken'));
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      setErrors({ general: 'Chỉ admin mới có thể tạo tài khoản' });
      console.error('🔧 Access denied: Not admin');
      return;
    }
    
    if (!validateForm()) {
      console.error('🔧 Form validation failed');
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');
      setErrors({});
      
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      
      console.log('🔧 Registration data:', registerData);
      
      // Register user
      const userResponse = await authService.register(registerData);
      console.log('🔧 User registration response:', userResponse);
      
      if (!userResponse.success) {
        console.error('🔧 User registration failed:', userResponse.message);
        setErrors({ submit: userResponse.message });
        return;
      }
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        role: registrationType,
        class_id: ''
      });
      
      // Tạo thông báo thành công mà không auto-login để giữ admin session
      if (registrationType === 'parent') {
        setSuccessMessage('Tạo tài khoản phụ huynh thành công! Bạn có thể tạo hồ sơ trẻ em riêng ở menu "Tạo hồ sơ trẻ em".');
      } else {
        setSuccessMessage('Tạo tài khoản giáo viên thành công!');
      }
      
    } catch (error) {
      console.error('🔧 Registration error:', error);
      setErrors({ submit: `Có lỗi khi tạo tài khoản: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-registration-container">
      <div className="parent-registration-form">
        <div className="form-header">
          <h2>
            {registrationType === 'teacher' 
              ? 'Tạo tài khoản cho giáo viên' 
              : 'Tạo tài khoản phụ huynh'
            }
          </h2>
        </div>

        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-danger">
            {errors.submit}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
             {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <h3>Thông tin tài khoản</h3>
            
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
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>

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
                {errors.password && <div className="error-message">{errors.password}</div>}
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
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>
            </div>

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
              {errors.full_name && <div className="error-message">{errors.full_name}</div>}
            </div>

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
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

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
              {errors.phone_number && <div className="error-message">{errors.phone_number}</div>}
            </div>

            {/* Teacher-specific fields */}
            {registrationType === 'teacher' && (
              <>
                <div className="form-group">
                  <label htmlFor="class_id">Lớp phụ trách *</label>
                  <select
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    className={`form-control ${errors.class_id ? 'is-invalid' : ''}`}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        Lớp {classItem.name}
                      </option>
                    ))}
                  </select>
                  {errors.class_id && <div className="error-message">{errors.class_id}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="address">Địa chỉ</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Nhập địa chỉ (không bắt buộc)"
                    rows="2"
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin')}
            >
              Quay lại
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : `Tạo tài khoản ${registrationType === 'teacher' ? 'giáo viên' : 'phụ huynh'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentRegistration;