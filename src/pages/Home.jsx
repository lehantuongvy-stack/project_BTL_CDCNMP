import React from 'react';
import Header from '../components/common/Header.jsx';
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
      <Header />
      <div className="home-container">
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
