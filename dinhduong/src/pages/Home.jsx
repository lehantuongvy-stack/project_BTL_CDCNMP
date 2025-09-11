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
              <img src="/images/news.jpg" alt="Tin tức 1" />
              <img src="/images/news.jpg" alt="Tin tức 2" />
              <img src="/images/news.jpg" alt="Tin tức 3" />
              <img src="/images/news.jpg" alt="Tin tức 4" />
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
