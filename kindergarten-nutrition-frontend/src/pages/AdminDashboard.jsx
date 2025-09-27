import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import childService from '../services/childService.js';
import ChildrenManagement from '../components/children/ChildrenManagement.jsx';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    totalChildren: 0,
    attendanceRate: 0,
    totalTeachers: 0,
    mealsServed: 0
  });
  const [loading, setLoading] = useState(true);
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [showCreateAccountDropdown, setShowCreateAccountDropdown] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log(' Loading dashboard data...');
        
        // Lấy tổng số trẻ em từ API
        const childrenResponse = await childService.getAllChildren();
        console.log(' Children API response:', childrenResponse);
        
        const totalChildren = childrenResponse.data?.children?.length || 0;
        console.log(' Total children count:', totalChildren);
        
        setDashboardData(prev => ({
          ...prev,
          totalChildren
        }));
        
        console.log(' Dashboard data loaded successfully');
        
      } catch (error) {
        console.error(' Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // No need to navigate manually, ProtectedRoute will handle it
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, the AuthContext will clear local data
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

  // Tạo màu avatar động
  const getAvatarColor = (fullName) => {
    if (!fullName) return '#667eea';
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    const index = fullName.length % colors.length;
    return colors[index];
  };

  // Handle navigation
  const handleNavigation = (itemId) => {
    if (itemId === 'logout') {
      handleLogout();
    } else if (itemId === 'create-teacher') {
      navigate('/admin/register?type=teacher');
    } else if (itemId === 'create-parent') {
      navigate('/admin/register?type=parent');
    } else if (itemId === 'create-account') {
      setShowCreateAccountDropdown(!showCreateAccountDropdown);
    }
    // Add other navigation cases as needed
  };

  // Handle More Info click
  const handleMoreInfo = async (statType) => {
    console.log(' handleMoreInfo called with:', statType);
    if (statType === 'children') {
      console.log(' Setting activeSection to children');
      // Navigate to children management section
      setActiveSection('children');
      console.log(' activeSection set, current value:', 'children');
    }
  };

  // Dashboard stats with real data
  const dashboardStats = [
    { 
      title: 'Tổng số trẻ em', 
      value: loading ? '...' : dashboardData.totalChildren, 
      color: 'pink', 
      description: 'Tăng 5% so với tháng trước',
      moreInfo: true 
    },
    { 
      title: 'Tỷ lệ có mặt', 
      value: dashboardData.attendanceRate, 
      color: 'green', 
      description: 'Tỷ lệ điểm danh hôm nay' 
    },
    { 
      title: 'Giáo viên', 
      value: dashboardData.totalTeachers,  
      color: 'orange', 
      description: 'Đội ngũ giáo viên' 
    },
    { 
      title: 'Bữa ăn phục vụ', 
      value: dashboardData.mealsServed, 
      color: 'red', 
      description: 'Bữa ăn hôm nay' 
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Thêm món ăn mới: Cháo gà với rau củ', user: 'Cô Lan', time: '10 phút trước', type: 'meal' },
    { id: 2, action: 'Cập nhật thông tin trẻ: Nguyễn Minh An', user: 'Cô Hương', time: '25 phút trước', type: 'child' },
    { id: 3, action: 'Tạo báo cáo dinh dưỡng tuần 3', user: 'Chuyên viên Minh', time: '1 giờ trước', type: 'report' },
    { id: 4, action: 'Thêm nguyên liệu: Cà rốt - 10kg', user: 'Admin', time: '2 giờ trước', type: 'ingredient' },
    { id: 5, action: 'Phê duyệt thực đơn tuần tới', user: 'Hiệu trưởng', time: '3 giờ trước', type: 'menu' }
  ];

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'children', name: 'Quản lý trẻ em'},
    { id: 'teachers', name: 'Quản lý giáo viên'},
    { id: 'meals', name: 'Quản lý bữa ăn'},
    { id: 'nutrition', name: 'Dinh dưỡng' },
    { id: 'reports', name: 'Báo cáo' },
    { id: 'warehouse', name: 'Kho hàng' },
    { id: 'settings', name: 'Cài đặt' }
  ];

  const userMenuItems = [
    { id: 'profile', name: 'Profile' },
    { id: 'create-account', name: 'Tạo tài khoản' },
    { id: 'settings', name: 'Settings' },
    { id: 'logout', name: 'Logout' }
  ];

  const renderContent = () => {
    console.log(' renderContent called, activeSection:', activeSection);
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="overview-content">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">
                <strong>Dashboard</strong>
              </h1>
              <div className="page-actions">
                <button className="btn btn-primary">Share</button>
                <button className="btn btn-secondary">Export</button>
                <div className="dropdown">
                  <button className="btn btn-outline"> This week ▼</button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              {dashboardStats.map((stat, index) => (
                <div key={index} className={`stat-card stat-card-${stat.color}`}>
                  <div className="stat-header">
                    <span className="stat-icon">{stat.icon}</span>
                    <span className="stat-title">{stat.title}</span>
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-footer">
                    <span 
                      className="more-info" 
                      onClick={() => {
                        console.log(' More info clicked for:', stat.title);
                        if (stat.moreInfo && stat.title === 'Tổng số trẻ em') {
                          console.log(' Condition met, calling handleMoreInfo');
                          handleMoreInfo('children');
                        } else {
                          console.log(' Condition not met, stat.moreInfo:', stat.moreInfo, 'title:', stat.title);
                        }
                      }}
                      style={{ cursor: stat.moreInfo ? 'pointer' : 'default' }}
                    >
                      More info 
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activities */}
            <div className="activity-section">
              <h3>Hoạt động gần đây</h3>
              <div className="activities-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'meal' }
                      {activity.type === 'child'}
                      {activity.type === 'report'}
                      {activity.type === 'ingredient' }
                      {activity.type === 'menu'}
                    </div>
                    <div className="activity-info">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-meta">bởi <strong>{activity.user}</strong> • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'children':
        console.log(' Rendering ChildrenManagement component');
        return <ChildrenManagement />;
      
      case 'meals':
        return (
          <div className="section-content">
            <h2>Quản lý bữa ăn</h2>
            <p>Chức năng quản lý thực đơn và bữa ăn...</p>
            <button className="btn-primary" onClick={() => navigate('/menu')}>
              Xem thực đơn
            </button>
          </div>
        );
      
      case 'reports':
        return (
          <div className="section-content">
            <h2>Báo cáo</h2>
            <p>Tạo và xem các báo cáo dinh dưỡng...</p>
            <button className="btn-primary" onClick={() => navigate('/report')}>
              Xem báo cáo
            </button>
          </div>
        );
      
      default:
        return (
          <div className="section-content">
            <h2>{menuItems.find(item => item.id === activeSection)?.name}</h2>
            <p>Chức năng đang được phát triển...</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Top Navigation */}
      <nav className="top-navbar">
        <div className="navbar-brand">
          <div className="brand-icon"></div>
          <span className="brand-text">Quản lý Dinh dưỡng Mầm non</span>
        </div>
        <div className="navbar-nav">
          <div className="nav-item">
            <span className="nav-link">Home</span>
          </div>
          <div className="nav-item">
            <span className="nav-link">Documentation</span>
          </div>
        </div>
        <div className="navbar-actions">
          <div className="notification-badge">
            <span className="badge badge-danger">8</span>
          </div>
          <div className="notification-badge">
            <span className="badge badge-success">6</span>
          </div>
          <div className="user-dropdown" onClick={() => setShowCreateAccountDropdown(!showCreateAccountDropdown)}>
            <div 
              className="dynamic-avatar" 
              style={{ backgroundColor: getAvatarColor(user?.full_name) }}
            >
              {getAvatarText(user?.full_name)}
            </div>
            <div className="user-info">
              <span className="welcome-text">Chào mừng</span>
              <span className="user-name">{user?.full_name || user?.username}</span>
            </div>
            <button 
              className="logout-button" 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Đăng xuất"
            >
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h6 className="sidebar-heading">Main Navigation</h6>
            <nav className="sidebar-nav">
              {menuItems.map(item => (
                <div
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                  {item.id === 'dashboard' && <span className="badge badge-primary">14</span>}
                </div>
              ))}
            </nav>
          </div>

          <div className="sidebar-section">
            <h6 className="sidebar-heading">User Area</h6>
            <nav className="sidebar-nav">
              {userMenuItems.map(item => (
                <div key={item.id} className="nav-item-wrapper">
                  <div
                    className="nav-item"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.name}</span>
                    {item.id === 'profile' && <span className="badge badge-info">3</span>}
                    {item.id === 'create-account' && (
                      <span className="dropdown-arrow">
                        {showCreateAccountDropdown ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                  
                  {/* Dropdown for Create Account */}
                  {item.id === 'create-account' && showCreateAccountDropdown && (
                    <div className="nav-dropdown">
                      <div 
                        className="nav-dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation('create-teacher');
                        }}
                      >
                        <span className="nav-text">Tạo tài khoản giáo viên</span>
                      </div>
                      <div 
                        className="nav-dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation('create-parent');
                        }}
                      >
                        <span className="nav-text">Tạo tài khoản phụ huynh</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {renderContent()}
        </div>
      </div>

      {/* Children Details Modal */}
      {showChildrenModal && (
        <div className="modal-overlay" onClick={() => setShowChildrenModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Danh sách trẻ em</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowChildrenModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <p>Đang tải...</p>
              ) : childrenDetails.length > 0 ? (
                <div className="children-list">
                  {childrenDetails.map((child, index) => (
                    <div key={child.id || index} className="child-item">
                      <div className="child-info">
                        <h4>{child.full_name || 'Không có tên'}</h4>
                        <p><strong>Mã trẻ:</strong> {child.student_id || 'N/A'}</p>
                        <p><strong>Ngày sinh:</strong> {child.date_of_birth || 'Không có thông tin'}</p>
                        <p><strong>Lớp:</strong> {child.class_name || 'Chưa phân lớp'}</p>
                        <p><strong>Phụ huynh:</strong> {child.parent_name || 'Không có thông tin'}</p>
                        <p><strong>Số điện thoại:</strong> {child.parent_phone || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có dữ liệu trẻ em</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;