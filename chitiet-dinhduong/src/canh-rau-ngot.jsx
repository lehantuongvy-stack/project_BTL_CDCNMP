import React from "react";
import "./ChiTiet.css";

export default function CanhRauNgot() {
  return (
    <div className="container">
      <button className="back-btn" onClick={() => window.history.back()}>←</button>
      <div className="title">CanhRauNgot</div>

      <div className="content">
        <img src="/canh-hau-ngot.png" alt="Canh rau ngót" />

        <div className="info">
          <div className="section">
            <h3>Nguyên liệu</h3>
            <ul>
              <li>Rau ngót</li>
              <li>Thịt băm</li>
              <li>Gia vị</li>
            </ul>
          </div>

          <div className="section">
            <h3>Chế biến</h3>
              <ul>
              <li>Rửa sạch rau ngót, vò nhẹ.</li>
              <li>Xào thịt băm với gia vị, thêm nước đun sôi.</li>
              <li>Cho rau ngót vào, nấu chín là dùng.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}