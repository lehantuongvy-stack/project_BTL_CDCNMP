import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/background.css';
import '../styles/Home.css';

const menuData = [
  {
    title: "Nhà trẻ",
    meals: {
      Sáng: ["Sữa Friso", "Cháo gà cà rốt"],
      Trưa: ["Cháo cá thịt rau cải cúc"],
      Chiều: ["Cháo thịt khoai lang"]
    }
  },
  {
    title: "Mẫu giáo",
    meals: {
      Sáng: ["Sữa Friso", "Phở gà"],
      Trưa: ["Rau bắp cải luộc", "Thịt băm sốt cà chua", "Cơm trắng"],
      Chiều: ["Xôi lạc"]
    }
  }
];

function MenuSection({ title, meals }) {
  return (
    <div className="menu-section-home">
      <h4>{title}</h4>
      {Object.entries(meals).map(([mealTime, dishes], index) => (
        <p key={index}>
          <b>{mealTime}</b><br />
          {dishes.join(", ")}
        </p>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="home">
      <div className="home-container">
        {/* Menu */}
        <nav>
          <ul className="menu-home">
            <li>Trang chủ</li>
            <li>Giới thiệu</li>
            <li>Kho nguyên liệu</li>
            <li>Góc phụ huynh</li>
            <li>Quản lý sức khỏe</li>
            <li>Thư viện món ăn</li>
            
            {/* User info và logout */}
            <li className="user-section">
              <div className="user-info">
                <div className="user-avatar">
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
            </li>
          </ul>
        </nav>

        <div className="content-home">
          {/* Sidebar trái */}
          <aside className="sidebar-left-home">
            <div className="contact-home">
              <h3>Điện thoại</h3>
              <p>Trường mầm non ABC</p>
              <p>(08) 38.000.000</p>
            </div>
            <button className="report-btn-home">BÁO CÁO</button>
          </aside>

          {/* Khu vực chính */}
          <main className="main-area-home">
            <div className="news-grid">
              <a
                href="https://baomoi.com/cac-nhom-chat-dinh-duong-can-thiet-cho-tre-mam-non-c53117200.epi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news1.jpg" alt="Tin tức 1" />
              </a>

              <a
                href="https://thanhnien.vn/dinh-duong-cho-tre-tags572210.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news2.jpg" alt="Tin tức 2" />
              </a>

              <a
                href="https://bvquan5.medinet.gov.vn/chuyen-muc/cac-nhom-chat-dinh-duong-can-thiet-cho-tre-mam-non-cmobile16572-244790.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news3.jpg" alt="Tin tức 3" />
              </a>

              <a
                href="https://moh.gov.vn/hoat-dong-cua-dia-phuong/-/asset_publisher/gHbla8vOQDuS/content/cham-soc-suc-khoe-cho-tre-mam-non-au-nam-hoc-moi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news4.jpg" alt="Tin tức 4" />
              </a>
            </div>
          </main>

          {/* Sidebar phải */}
          <aside className="sidebar-right-home">
            <h3>THỰC ĐƠN HÔM NAY</h3>
            {menuData.map((menu, index) => (
              <MenuSection key={index} title={menu.title} meals={menu.meals} />
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
