import React from "react";
import { useParams, Link } from "react-router-dom";
import monAn from "../data/monan.js";
import "../styles/monan.css";

function ChitietMon() {
  const { id } = useParams();
  const mon = monAn.find((m) => m.id === parseInt(id));

  if (!mon) return <h2>Món ăn không tồn tại</h2>;

  return (
    <div className="container">
      <div>
        <Link to="/thuvienmonan" className="back-btn">← Quay lại</Link>
        <h1>{mon.ten}</h1>
      </div>
      <div className="detail-content">
        <div className="image-section">
          <img src={mon.anh} alt={mon.ten} className="food-image" />
        </div>
        <div className="info-section">
          <h2 className="section-title">Nguyên liệu</h2>
          <ul>
            {mon.nguyenLieu.map((nl, i) => <li key={i}>{nl}</li>)}
          </ul>
          <h2 className="section-title">Chế biến</h2>
          <ul>
            {mon.cheBien.map((cb, i) => <li key={i}>{cb}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChitietMon;
