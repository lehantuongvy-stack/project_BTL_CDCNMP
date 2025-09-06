import React from "react";
import "./ChiTiet.css";

export default function DuaHau() {
  return (
    <div className="container">
      <button className="back-btn" onClick={() => window.history.back()}>←</button>
      <div className="title">DƯA HẤU</div>

      <div className="content">
        <img src="/dua-hau.png" alt="Dưa hấu" />

        <div className="info">
          <div className="section">
            <h3>Nguyên liệu</h3>
            <ul>
              <li>Dưa hấu nhập từ đại lý uy tín</li>
            </ul>
          </div>

          <div className="section">
            <h3>Chế biến</h3>
            <ul>
              <li>Gọt vỏ, bổ miếng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}