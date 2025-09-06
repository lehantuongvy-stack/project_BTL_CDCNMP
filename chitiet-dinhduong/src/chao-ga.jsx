import React from "react";
import "./ChiTiet.css";

export default function ChaoGa() {
  return (
    <div className="container">
      <button className="back-btn" onClick={() => window.history.back()}>←</button>
      <div className="title">CHÁO GÀ</div>

      <div className="content">
        <img src="/chao-ga.png" alt="Cháo gà" />

        <div className="info">
          <div className="section">
            <h3>Nguyên liệu</h3>
            <ul>
              <li>Thịt gà</li>
              <li>Cà rốt</li>
              <li>Gạo</li>
            </ul>
          </div>

          <div className="section">
            <h3>Chế biến</h3>
            <ul>
              <li>Cà rốt, thịt gà băm nhỏ, xào chín.</li>
              <li>Nấu như cháo, cho hỗn hợp vào khuấy đều.</li>
              <li>Dun sôi thêm 2-3 phút.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
