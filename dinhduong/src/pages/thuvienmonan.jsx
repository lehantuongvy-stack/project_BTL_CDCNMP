import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import "../styles/thuvienmonan.css";


function ThuvienMonan() {
  const monAn = [
    { id: 1, ten: "Cháo gà", anh: "/src/assets/chao-ga.jpg" },
    { id: 2, ten: "Canh rau ngót", anh: "/src/assets/canh-rau-ngot.jpg" },
    { id: 3, ten: "Sữa chua", anh: "/src/assets/sua-chua.jpg" },
    { id: 4, ten: "Cơm trắng", anh: "/src/assets/com-trang.jpg" },
    { id: 5, ten: "Dưa hấu", anh: "/src/assets/dua-hau.jpg" },
    { id: 6, ten: "Xôi lạc", anh: "/src/assets/xoi-lac.jpg" },
    { id: 7, ten: "Thịt băm xào ngô", anh: "/src/assets/thit-bam-xao-ngo.jpg" },
    { id: 8, ten: "Xôi gấc", anh: "/src/assets/xoi-gac.jpg" },
    { id: 9, ten: "Cháo hến", anh: "/src/assets/chao-hen.jpg" },
    { id: 10, ten: "Giá xào thịt bò", anh: "/src/assets/gia-xao-thit-bo.jpg" },
    { id: 11, ten: "Canh bí đỏ", anh: "/src/assets/canh-bi-do.jpg" },
    { id: 12, ten: "Rau bắp cải luộc", anh: "/src/assets/rau-bap-cai-luoc.jpg" },
    { id: 13, ten: "Canh cà chua", anh: "/src/assets/canh-ca-chua.jpg" },
    { id: 14, ten: "Trứng rán", anh: "/src/assets/trung-ran.jpg" },
    { id: 15, ten: "Thịt kho", anh: "/src/assets/thit-kho.jpg" },
    { id: 16, ten: "Cháo đậu xanh", anh: "/src/assets/chao-dau-xanh.jpg" },
  ];

  const [search, setSearch] = useState("");

  const filteredMonAn = monAn.filter((item) =>
    item.ten.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="thu-vien">
      <div><Link to="/" className="back-btn">← Quay lại</Link></div>
      {/* Ô tìm kiếm góc trên bên phải */}
      <input
        type="text"
        className="search-box"
        placeholder="Tìm món ăn..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Tiêu đề ở chính giữa */}
      <h1 className="title">THƯ VIỆN MÓN ĂN</h1>

      <div className="grid">
        {filteredMonAn.map((item) => (
          <div className="card" key={item.id}>
            <img src={item.anh} alt={item.ten} />
            <p>{item.ten}</p>
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