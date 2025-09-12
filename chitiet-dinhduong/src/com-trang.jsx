import React from "react";
import "./ChiTiet.css";

export default function ComTrang() {
  return (
    <div className="container">
      <button className="back-btn" onClick={() => window.history.back()}>←</button>
      <div className="title">Cơm Trắng</div>

      <div className="content">
        <img src="/com-trang.png" alt="Cơm trắng" />

        <div className="info">
          <div className="section">
            <h3>Nguyên liệu</h3>
             <ul>
              <li>Gạo tẻ</li>
              <li>Nước</li>
            </ul>
          </div>

          <div className="section">
            <h3>Chế biến</h3>
            <ul>
              <li>Gạo vo sạch, cho nước vừa đủ</li>
              <li>Nấu trong nồi cơm điện.</li>
              <li>Cơm chín, để ủ 10 phút rồi dùng.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}