import React from "react";
import { Link } from "react-router-dom"; // thêm import
import "../styles/thuvienmonan.css";

function ThuvienMonan() {
  const monAn = [
    { id: 1, ten: "Cháo gà", anh: "/src/assets/chao-ga.jpg" },
    { id: 2, ten: "Canh rau ngót", anh: "/src/assets/canh-rau-ngot.jpg" },
    { id: 3, ten: "Sữa chua", anh: "/src/assets/sua-chua.jpg" },
    { id: 4, ten: "Cơm trắng", anh: "/src/assets/com-trang.jpg" },
    { id: 5, ten: "Dưa hấu", anh: "/src/assets/dua-hau.jpg" },
    { id: 6, ten: "Xôi lạc", anh: "/src/assets/xoi-lac.jpg" },
  ];

  return (
    <div className="thu-vien">
      <h1 className="title">THƯ VIỆN MÓN ĂN</h1>
      <div className="grid">
        {monAn.map((item) => (
          <div className="card" key={item.id}>
            <img src={item.anh} alt={item.ten} />
            <p>{item.ten}</p>
            {/* Nút link sang trang chi tiết */}
            <Link to={`/mon/${item.id}`} className="detail-btn">
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThuvienMonan;