import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import childService from '../services/childService.js';
import userService from '../services/userService.js';
import reportService from '../services/nutritionrpService.js';
import CreateReport from './CreateReport.jsx';
import WarehouseForm from './WarehouseForm.jsx';
import warehouseService from '../services/warehouseService.js';
import parentFeedbackService from '../services/parentFeedbackService.js';
import ChildrenManagement from '../components/children/ChildrenManagement.jsx';
import TeacherManagement from '../components/teachers/TeacherManagement.jsx';
import ParentManagement from '../components/parents/ParentManagement.jsx';
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
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Load danh sách ý kiến phụ huynh
  const loadFeedbacks = async () => {
    try {
      setLoadingFeedbacks(true);
 
      const response = await parentFeedbackService.getAllFeedback();
    
      // Lấy tối đa 5 ý kiến mới nhất
      const feedbackList = response.data?.slice(0, 5) || [];
      setFeedbacks(feedbackList);
    } catch (error) {
      console.error('Lỗi khi tải ý kiến phụ huynh:', error);
      setFeedbacks([]);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // Load dashboard data
  useEffect(() => {
    // Chỉ load data khi user đã được load từ AuthContext
    if (!user) {
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Lấy tổng số trẻ em từ API
        const childrenResponse = await childService.getAllChildren();
        
        const totalChildren = childrenResponse.data?.children?.length || 0;
        
        let totalTeachers = 0;
        
        // Chỉ gọi API stats khi user là admin
        if (user?.role === 'admin') {
          try {
            const userStatsResponse = await userService.getUserStats();
            
            // Parse user stats để lấy số lượng giáo viên
            const userStats = userStatsResponse.data?.stats || [];
            const teacherStats = userStats.find(stat => stat.role === 'teacher');
            totalTeachers = teacherStats ? teacherStats.count : 0;
          } catch (statsError) {
            console.warn(' Could not load user stats (may not be admin):', statsError.message);
          }
        } else {
          console.log(' User is not admin, skipping user stats API');
        }
        
        setDashboardData(prev => ({
          ...prev,
          totalChildren,
          totalTeachers
        }));
        
        console.log(' Dashboard data loaded successfully');
        
      } catch (error) {
        console.error(' Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Load feedbacks when dashboard section is active
  useEffect(() => {
    if (activeSection === 'dashboard' && user?.role === 'admin') {
      loadFeedbacks();
    }
  }, [activeSection, user]);

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
    } else if (itemId === 'create-child') {
      navigate('/admin/create-child');
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
    } else if (statType === 'teachers') {
      console.log(' Setting activeSection to teachers');
      // Navigate to teachers management section
      setActiveSection('teachers');
      console.log(' activeSection set, current value:', 'teachers');
    }
  };

  // phần báo cáo
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showViewReport, setShowViewReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Load báo cáo ngay khi component mount
  useEffect(() => {
    loadReports();
  }, []);

  //hiển thị báo cáo
  useEffect(() => {
  if (activeSection === 'reports') {
    loadReports();
  }
  }, [activeSection]);

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      const res = await reportService.getAllReports();

      
      // Xử lý data - nếu là object thì chuyển thành array
      let reportsData = res.data || [];
      if (!Array.isArray(reportsData)) {
        reportsData = [reportsData]; // Chuyển object thành array
      }
      
      setReports(reportsData);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };
  // Tạo báo cáo mới
  const handleCreateReport = async (reportData) => {
  try {
    const result = await reportService.createReport(reportData);
    setShowCreateReport(false);
    loadReports(); // refresh danh sách
  } catch (err) {
    console.error('Error creating report:', err);
  }
};

//kho nguyên liệu
  const [warehouseData, setWarehouseData] = useState([]);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);

  const loadWarehouse = async () => {
  try {
    setLoadingWarehouse(true);
    const res = await warehouseService.getAll();
    setWarehouseData(res.data);
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu kho:', err);
  } finally {
    setLoadingWarehouse(false);
  }
};
useEffect(() => {
  if (activeSection === 'warehouse') {
    loadWarehouse();
  }
}, [activeSection]);

  // Load reports when reports section is active
  useEffect(() => {
    if (activeSection === 'reports') {
      loadReports();
    }
  }, [activeSection]);

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
      title: 'Giáo viên', 
      value: loading ? '...' : dashboardData.totalTeachers,  
      color: 'orange', 
      description: 'Đội ngũ giáo viên',
      moreInfo: true 
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
    { id: 'parents', name: 'Quản lý phụ huynh'},
    { id: 'meals', name: 'Quản lý bữa ăn'},
    { id: 'nutrition', name: 'Dinh dưỡng' },
    { id: 'reports', name: 'Báo cáo' },
    { id: 'warehouse', name: 'Kho hàng' },
  ];

  const userMenuItems = [
    { id: 'create-account', name: 'Tạo tài khoản' },
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
                        if (stat.moreInfo) {
                          if (stat.title === 'Tổng số trẻ em') {
                            console.log(' Navigating to children management');
                            handleMoreInfo('children');
                          } else if (stat.title === 'Giáo viên') {
                            console.log(' Navigating to teachers management');
                            handleMoreInfo('teachers');
                          }
                        } else {
                          console.log(' No moreInfo available for:', stat.title);
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
              <h3>Ý kiến đóng góp phụ huynh</h3>

              {/* Danh sách ý kiến phụ huynh */}
              {loadingFeedbacks ? (
                <p>Đang tải ý kiến...</p>
              ) : feedbacks.length > 0 ? (
                <ul className="feedback-list">
                  {feedbacks.map((fb, index) => (
                    <li key={fb.id || index} className="feedback-item">
                      <div className="feedback-header">
                        <strong>{fb.parent_name || 'Phụ huynh'}</strong>
                        {fb.danh_gia_sao && (
                          <span className="feedback-stars">
                            {'⭐'.repeat(fb.danh_gia_sao)}
                          </span>
                        )}
                      </div>
                      <div className="feedback-body">
                        <p><b>{fb.tieu_de || 'Không có tiêu đề'}</b></p>
                        <p>{fb.noi_dung}</p>
                      </div>
                      <div className="feedback-footer">
                        <small>Trẻ: {fb.child_name || 'N/A'}</small>
                        <small> | Ngày: {new Date(fb.created_at).toLocaleString('vi-VN')}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có ý kiến phụ huynh nào.</p>
              )}
            </div>
          </div>
        );
      
      case 'children':
        console.log(' Rendering ChildrenManagement component');
        return <ChildrenManagement />;

      case 'teachers':
        console.log(' Rendering TeacherManagement component');
        return <TeacherManagement />;

      case 'parents':
        console.log(' Rendering ParentManagement component');
        return <ParentManagement />;
      
      case 'meals':
        return (
          <div className="section-content">
            <h2>Quản lý bữa ăn</h2>
            <p>Chức năng quản lý thực đơn và bữa ăn...</p>
            <button className="btn-primary" onClick={() => navigate('/kitchen-menu')}>
              Xem thực đơn
            </button>
          </div>
        );
      
      case 'reports':
        return (
          <div className="section-content">
            <div className="reports-header">
              <h2>Báo cáo</h2>
              <p>Tạo và xem các báo cáo dinh dưỡng...</p>
              <button 
                className="btn-primary create-report-btn" 
                onClick={() => navigate('/create')}
              >
                + Tạo báo cáo
              </button>
            </div>

            <div className="reports-list-section">
              <div className="reports-table-container">
                {/* Hiển thị danh sách báo cáo */}
                {loadingReports ? (
                  <p>Đang tải báo cáo...</p>
                ) : reports.length > 0 ? (
                  <table className="reports-table">
                  <thead>
                  <tr>
                    <th>Tên báo cáo</th>
                    <th>Tên trường</th>
                    <th>Ngày báo cáo</th>
                    <th>Số trẻ</th>
                    <th>Số suất/ngày</th>
                    <th>Người tạo</th>
                    <th>Thao tác</th>
                  </tr>
                  </thead>
                  <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.report_name}</td>
                    <td>{r.school_name}</td>
                    <td>{r.report_date}</td>
                    <td>{r.num_children}</td>
                    <td>{r.meals_per_day}</td>
                    <td>{r.created_by}</td>
                    <td>
                    <button 
                      onClick={() => {
                        setSelectedReport(r);
                        setShowViewReport(true);
                      }}
                    > 
                      Xem
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Bạn có chắc muốn xóa báo cáo này?')) {
                          try {
                            await reportService.deleteReport(r.id);
                            loadReports();
                          } catch (error) {
                            alert('Có lỗi khi xóa báo cáo: ' + error.message);
                          }
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Chưa có báo cáo nào</p>
        )}
        </div>
        </div>

        {/* Modal tạo báo cáo */}
        {showCreateReport && (
          <div className="modal-overlay" onClick={() => setShowCreateReport(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <CreateReport
                onSave={handleCreateReport}
                onCancel={() => setShowCreateReport(false)}
              />
            </div>
          </div>
        )}

        {/* Modal xem báo cáo */}
        {showViewReport && selectedReport && (
          <div className="modal-overlay" onClick={() => setShowViewReport(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <CreateReport
                reportData={selectedReport}
                readOnly={true}
                onCancel={() => setShowViewReport(false)}
              />
            </div>
          </div>
        )}
      </div>
      );

        case 'warehouse':
          return (
            <div className="section-content">
              <h2>Kho hàng</h2>
              <p>Quản lý nguyên liệu, số lượng và tình trạng kho.</p>

              <div className="warehouse-list-section">
                <div className="warehouse-table-container">
              {loadingWarehouse ? (
                <p>Đang tải dữ liệu...</p>
              ) : warehouseData.length > 0 ? (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Tên nguyên liệu</th>
                      <th>Tình trạng</th>
                      <th>Tổng số lượng</th>
                      <th>Ngày xuất</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                <tbody>
                {warehouseData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nguyen_lieu}</td>
                    <td>{item.tinh_trang}</td>
                    <td>{item.tong_so_luong}</td>
                    <td>{item.ngay_xuat?.slice(0, 10)}</td>
                    <td>
                    <button onClick={() => { 
                      console.log('Clicked warehouse item:', item);
                      setSelectedItem(item); 
                      setShowWarehouseForm(true); 
                    }}>
                      Xem
                    </button>
                    <button onClick={async () => {
                      if (window.confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
                        try {
                          const result = await warehouseService.delete(item.id);
                          alert('Xóa nguyên liệu thành công!');
                          loadWarehouse();
                        } catch (error) {
                          console.error('Error deleting warehouse item:', error);
                          alert('Lỗi khi xóa nguyên liệu: ' + error.message);
                        }
                      }
                    }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Kho hiện chưa có dữ liệu</p>
        )}
        </div>
        </div>

        {/* Modal hiển thị form xem chi tiết */}
        {showWarehouseForm && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowWarehouseForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <WarehouseForm
                initialData={selectedItem}
                readOnly={true}
                onCancel={() => setShowWarehouseForm(false)}
              />
            </div>
          </div>
        )}
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
                      
                      <div 
                        className="nav-dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation('create-child');
                        }}
                      >
                        <span className="nav-text">Tạo hồ sơ trẻ em</span>
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