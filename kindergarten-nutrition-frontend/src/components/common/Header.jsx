import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Chuyển về trang đăng nhập
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/'); // Vẫn chuyển về trang đăng nhập nếu có lỗi
    }
  };

  // Tạo avatar từ tên user
  const getAvatarText = (fullName) => {
    if (!fullName) return 'U';
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
    }
    return fullName.charAt(0);
  };

  // Xử lý click vào user avatar 
  const handleAvatarClick = () => {
    navigate('/account-info');
  };

  // Navigation items khác nhau theo role
  const getNavItems = () => {
    if (user?.role === 'parent') {
      return [
        { id: 'home', label: 'Trang chủ', path: '/home' },
        { id: 'parent', label: 'Góc phụ huynh', path: '/parent' },
        { id: 'health', label: 'Quản lý sức khỏe', path: '/health' },
        { id: 'library', label: 'Thư viện món ăn', path: '/thuvienmonan' },
        { id: 'tre', label: 'Trẻ', path: '/tre' }
      ];
    } else if (user?.role === 'teacher') {
      return [
        { id: 'home', label: 'Trang chủ', path: '/home' },
        { id: 'warehouse', label: 'Kho nguyên liệu', path: '/warehouse' },
        { id: 'health', label: 'Quản lý sức khỏe', path: '/health-manager' },
        { id: 'library', label: 'Thư viện món ăn', path: '/thuvienmonan' },
        { id: 'students', label: 'Lớp của tôi', path: '/list-students' }
      ];
    } 
  };

  const navItems = getNavItems();

  // Xử lý navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Kiểm tra active route
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="modern-header">
      <div className="header-wrapper">
        {/* Navigation Menu - Center */}
        <nav className="center-navigation">
          <ul className="nav-menu-horizontal">
            {navItems.map((item) => (
              <li 
                key={item.id}
                className={`nav-item-horizontal ${isActiveRoute(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section - Moved to right with new pink color */}
        <div className="user-section-right">
          <div className="user-info">
            <div 
              className="user-avatar clickable-avatar"
              onClick={handleAvatarClick}
              title="Click để xem thông tin cá nhân"
            >
              {getAvatarText(user?.full_name)}
            </div>
            <div className="user-greeting">
              <span className="welcome-text">Chào mừng</span>
              <span className="user-name">{user?.full_name || 'User'}</span>
            </div>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <img 
              src="/images/icon.png" 
              alt="Đăng xuất" 
              className="logout-icon" 
            /> 
            ĐĂNG XUẤT
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;