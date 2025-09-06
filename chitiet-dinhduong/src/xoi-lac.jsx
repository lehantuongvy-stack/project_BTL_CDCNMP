import React from "react";
import "./ChiTiet.css";

export default function XoiLac() {
  return (
    <div className="container">
      <button className="back-btn" onClick={() => window.history.back()}>←</button>
      <div className="title">XÔI LẠC</div>

      <div className="content">
        <img src="/xoi-lac.png" alt="Xôi lạc" />

        <div className="info">
          <div className="section">
            <h3>Nguyên liệu</h3>
            <ul>
              <li>Gạo nếp</li>
              <li>Lạc (đậu phộng)</li>
              <li>Muối</li>
            </ul>
          </div>

          <div className="section">
            <h3>Chế biến</h3>
            <ul>
              <li>Ngâm gạo nếp và lạc qua đêm.</li>
              <li>Đồ xôi đến khi chín mềm.</li>
              <li>Trộn đều, thêm chút muối mè khi ăn.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}