import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import childService from '../services/childService';
import '../styles/UserRegistration.css';

const ParentRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registrationType = searchParams.get('type') || 'teacher';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    phone_number: '',
    role: registrationType === 'parent' ? 'parent' : 'teacher'
  });
  
  // Parent-specific data
  const [childData, setChildData] = useState({
    child_id: '',
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    class_id: '',
    health_notes: '',
    allergies: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Debug auth info
  useEffect(() => {
    console.log('🔍 UserRegistration - Current user:', user);
    console.log('🔍 UserRegistration - Auth token:', localStorage.getItem('authToken'));
    console.log('🔍 UserRegistration - Registration type:', registrationType);
  }, [user, registrationType]);

  // Handle input change for user data
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

  // Handle input change for child data
  const handleChildChange = (e) => {
    const { name, value } = e.target;
    setChildData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[`child_${name}`]) {
      setErrors(prev => ({
        ...prev,
        [`child_${name}`]: ''
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

    // Child validation for parent registration
    if (registrationType === 'parent') {
      if (!childData.child_id.trim()) {
        newErrors.child_child_id = 'Mã trẻ là bắt buộc';
      }

      if (!childData.full_name.trim()) {
        newErrors.child_full_name = 'Tên trẻ là bắt buộc';
      }

      if (!childData.date_of_birth) {
        newErrors.child_date_of_birth = 'Ngày sinh là bắt buộc';
      }

      if (!childData.class_id.trim()) {
        newErrors.child_class_id = 'Lớp học là bắt buộc';
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
      
      // Create user account
      const userResponse = await authService.register(registerData);
      
      if (!userResponse.success) {
        throw new Error(userResponse.message || 'Tạo tài khoản thất bại');
      }

      console.log('✅ User registration successful:', userResponse);

      // If parent registration, auto-login and create child record
      if (registrationType === 'parent') {
        console.log('� Auto-login for child creation...');
        
        try {
          // Auto-login the newly created parent
          const loginResponse = await authService.login({
            email: registerData.email,
            password: registerData.password
          });
          
          if (!loginResponse.success) {
            console.warn('⚠️ Auto-login failed:', loginResponse.message);
            setSuccessMessage('Tạo tài khoản phụ huynh thành công! Vui lòng đăng nhập để tạo hồ sơ trẻ.');
            return;
          }
          
          // Update localStorage with new token
          if (loginResponse.data.token) {
            localStorage.setItem('authToken', loginResponse.data.token);
            console.log('🔑 Auth token updated:', loginResponse.data.token.substring(0, 20) + '...');
          }
          
          console.log('✅ Auto-login successful');
          
          // Now create child record with authenticated user
          console.log('📤 Creating child record for new parent:', childData);
          
          const childResponse = await childService.createChild(childData);
          
          if (!childResponse.success) {
            console.warn('⚠️ Child creation failed:', childResponse.message);
            setSuccessMessage(`Tạo tài khoản phụ huynh thành công! Tuy nhiên có lỗi khi tạo hồ sơ trẻ: ${childResponse.message}`);
          } else {
            console.log('✅ Child creation successful:', childResponse);
            setSuccessMessage('Tạo tài khoản phụ huynh và hồ sơ trẻ em thành công!');
          }
        } catch (error) {
          console.error('❌ Auto-login or child creation error:', error);
          setSuccessMessage(`Tạo tài khoản phụ huynh thành công! Tuy nhiên có lỗi khi tạo hồ sơ trẻ: ${error.message}`);
        }
      } else {
        setSuccessMessage('Tạo tài khoản giáo viên thành công!');
      }
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        email: '',
        phone_number: '',
        role: registrationType === 'parent' ? 'parent' : 'teacher'
      });

      if (registrationType === 'parent') {
        setChildData({
          child_id: '',
          full_name: '',
          date_of_birth: '',
          gender: 'male',
          class_id: '',
          health_notes: '',
          allergies: ''
        });
      }
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
      
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
          <h2>📝 Tạo tài khoản {registrationType === 'teacher' ? 'giáo viên' : 'phụ huynh'}</h2>
          <p>
            {registrationType === 'teacher' 
              ? 'Tạo tài khoản cho giáo viên mới' 
              : 'Tạo tài khoản phụ huynh và hồ sơ trẻ em'
            }
          </p>
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
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Two Column Layout for Parent Registration */}
          {registrationType === 'parent' ? (
            <div className="two-column-layout">
              {/* Left Column - User Account Section */}
              <div className="form-section left-column">
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
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu*</label>
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
              </div>

              {/* Right Column - Child Information Section */}
              <div className="form-section right-column">
                <h3>Thông tin trẻ em</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="child_id">Mã trẻ *</label>
                    <input
                      type="text"
                      id="child_id"
                      name="child_id"
                      value={childData.child_id}
                      onChange={handleChildChange}
                      className={`form-control ${errors.child_child_id ? 'is-invalid' : ''}`}
                      placeholder="Nhập mã trẻ"
                    />
                    {errors.child_child_id && <div className="error-message">{errors.child_child_id}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="child_full_name">Tên trẻ *</label>
                    <input
                      type="text"
                      id="child_full_name"
                      name="full_name"
                      value={childData.full_name}
                      onChange={handleChildChange}
                      className={`form-control ${errors.child_full_name ? 'is-invalid' : ''}`}
                      placeholder="Nhập tên đầy đủ của trẻ"
                    />
                    {errors.child_full_name && <div className="error-message">{errors.child_full_name}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_of_birth">Ngày sinh *</label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={childData.date_of_birth}
                      onChange={handleChildChange}
                      className={`form-control ${errors.child_date_of_birth ? 'is-invalid' : ''}`}
                    />
                    {errors.child_date_of_birth && <div className="error-message">{errors.child_date_of_birth}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Giới tính</label>
                    <select
                      id="gender"
                      name="gender"
                      value={childData.gender}
                      onChange={handleChildChange}
                      className="form-control"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="class_id">Lớp học *</label>
                  <input
                    type="text"
                    id="class_id"
                    name="class_id"
                    value={childData.class_id}
                    onChange={handleChildChange}
                    className={`form-control ${errors.child_class_id ? 'is-invalid' : ''}`}
                    placeholder="Nhập tên lớp (VD: Lá, Cành, etc.)"
                  />
                  {errors.child_class_id && <div className="error-message">{errors.child_class_id}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="health_notes">Ghi chú sức khỏe</label>
                  <textarea
                    id="health_notes"
                    name="health_notes"
                    value={childData.health_notes}
                    onChange={handleChildChange}
                    className="form-control"
                    placeholder="Ghi chú về tình trạng sức khỏe của trẻ (không bắt buộc)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="allergies">Dị ứng</label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    value={childData.allergies}
                    onChange={handleChildChange}
                    className="form-control"
                    placeholder="Ghi chú về các loại dị ứng của trẻ (không bắt buộc)"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Single Column Layout for Teacher Registration */
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
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin')}
              disabled={loading}
            >
              ← Quay lại
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