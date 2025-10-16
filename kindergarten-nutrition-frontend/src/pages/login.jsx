import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/login.css";

function Login() {
  // Sinh captcha 5 ký tự động
  const generateCaptcha = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    captcha: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error and success message when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle reload captcha
  const handleReloadCaptcha = () => {
    setCaptcha(generateCaptcha());
    setFormData(prev => ({
      ...prev,
      captcha: ""
    }));
    setErrors(prev => ({
      ...prev,
      captcha: ""
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    }
    
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }
    
    if (!formData.captcha.trim()) {
      newErrors.captcha = "Mã bảo vệ là bắt buộc";
    } else if (formData.captcha.toLowerCase() !== captcha.toLowerCase()) {
      newErrors.captcha = "Mã bảo vệ không đúng";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kiểm tra form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      setSuccessMessage("");
      
      // gọi API login
      const response = await login({
        username: formData.username,
        password: formData.password
      });
      
      // Xử lý res
      const userRole = response.data.user.role;
      const roleText = userRole === 'admin' ? 'Quản trị viên' : 
                      userRole === 'teacher' ? 'Giáo viên' :
                      userRole === 'parent' ? 'Phụ huynh' : 'Người dùng';
      
      setSuccessMessage(`Đăng nhập thành công! Chào mừng ${roleText}: ${response.data.user.full_name}`);
      
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }, 1500); 
      
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      
      if (error.message) {
        errorMessage = error.message.replace(/^HTTP \d+:\s*/, '');
 
        // Kiểm tra sai định dạng JSON
        try {
          const parsed = JSON.parse(errorMessage);
          if (parsed.message) {
            errorMessage = parsed.message;
          }
        } catch (parseError) {
          
        }
      }
      
      setErrors({
        general: errorMessage
      });
      setCaptcha(generateCaptcha());
      setFormData(prev => ({
        ...prev,
        captcha: ""
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="title">Quản lý</h2>
        <p className="subtitle">dinh dưỡng mầm non</p>

        {errors.general && (
          <div className="error-message" style={{
            color: '#ff4757',
            textAlign: 'center',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff4757',
            borderRadius: '4px'
          }}>
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="success-message" style={{
            color: '#2ed573',
            textAlign: 'center',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#e6ffe6',
            border: '1px solid #2ed573',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              name="username"
              placeholder="Tên đăng nhập" 
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.username && (
              <span className="error-text" style={{ color: '#ff4757', fontSize: '12px' }}>
                {errors.username}
              </span>
            )}
          </div>

          <div className="input-group">
            <input 
              type="password" 
              name="password"
              placeholder="Mật khẩu" 
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text" style={{ color: '#ff4757', fontSize: '12px' }}>
                {errors.password}
              </span>
            )}
          </div>

          <div className="captcha-group">
            <input 
              type="text" 
              name="captcha"
              placeholder="Nhập mã bảo vệ" 
              value={formData.captcha}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="captcha">{captcha}</span>
            
            {/* Nút reload captcha */}
            <button
              type="button"
              className="reload-btn"
              aria-label="Tải lại mã bảo vệ"
              onClick={handleReloadCaptcha}
              title="Tải lại mã"
              disabled={loading}
            >
              ↻
            </button>
            
            {errors.captcha && (
              <span className="error-text" style={{ color: '#ff4757', fontSize: '12px', width: '100%' }}>
                {errors.captcha}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;