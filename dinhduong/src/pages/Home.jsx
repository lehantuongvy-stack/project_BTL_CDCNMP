import '../styles/Home.css';
import '../styles/background.css';


export default function Home() {
  return (
    <div className="home">
      <div className="home-container">
        {/* Menu */}
        <nav>
          <ul className="menu">
            <li>Trang chủ</li>
            <li>Giới thiệu</li>
            <li>Kho nguyên liệu</li>
            <li>Góc phụ huynh</li>
            <li>Quản lý sức khỏe</li>
            <li>Thư viện món ăn</li>
          </ul>
        </nav>

        <div className="content">
          {/* Sidebar trái */}
          <aside className="sidebar-left">
            <div className="contact">
              <h3>Điện thoại</h3>
              <p>Trường mầm non ABC</p>
              <p>(08) 38.000.000</p>
            </div>
            <button className="report-btn">BÁO CÁO</button>
          </aside>

          {/* Khu vực chính (giữa) */}
          <main className="main-area">
            <img src="/images/news.jpg" alt="Tin tức" className="news-img" />
          </main>

          {/* Sidebar phải */}
          <aside className="sidebar-right">
            <h3>THỰC ĐƠN HÔM NAY</h3>
            <div className="menu-section">
              <h4>Nhà trẻ</h4>
              <p><b>Sáng</b><br/>Sữa Friso<br/>Cháo gà cà rốt</p>
              <p><b>Trưa</b><br/>Cháo cá thịt rau cải cúc</p>
              <p><b>Chiều</b><br/>Cháo thịt khoai lang</p>
            </div>

            <div className="menu-section">
              <h4>Mẫu giáo</h4>
              <p><b>Sáng</b><br/>Sữa Friso<br/>Phở gà</p>
              <p><b>Trưa</b><br/>Rau bắp cải luộc<br/>Thịt băm sốt cà chua<br/>Cơm trắng</p>
              <p><b>Chiều</b><br/>Xôi lạc</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
