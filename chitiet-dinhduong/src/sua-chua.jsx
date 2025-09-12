import React from "react";
import "./ChiTiet.css";

export default function SuaChua() {
  return (
    <div className="container">
      <button className="back-btn" onClick={() => window.history.back()}>←</button>
      <div className="title">SỮA CHUA</div>

      <div className="content">
        <img src="/sua-chua.png" alt="Sữa chua" />

        <div className="info">
          <div className="section">
            <h3>Nguyên liệu</h3>
            <ul>
              <li>Sữa tươi</li>
              <li>Đường</li>
              <li>Men cái (sữa chua cũ)</li>
            </ul>
          </div>

          <div className="section">
            <h3>Chế biến</h3>
            <ul>
              <li>Đun nóng sữa, cho đường khuấy đều.</li>
              <li>Để nguội bớt rồi thêm men.</li>
              <li>Ủ 6-8 tiếng, sau đó để tủ lạnh.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}