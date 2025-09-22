import React, { useState } from 'react';
import { Link } from "react-router-dom";
// import Header from "../components/Header";
// import '../components/header.css';
import BackButton from "../components/BackButton";
// import '../styles/background.css';
import "../styles/Report.css";

function Report() {

  const [form, setForm] = useState({
    tenBaocao: '',
    nguoiTao: '',
    lop: '',
    thang: ''
  });


   const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="home">
      {/* <Header /> */}
<BackButton />
      <div className="box">
        <div>
          {/* Tên báo cáo */}
          <label htmlFor="tenBaoCao">Tên báo cáo</label>
          <input name="tenBaocao" value={form.tenBaocao} onChange={handleChange} />

          {/* Tháng */}
          <label htmlFor="thang">Tháng</label>
          <input type="month" id="thang" name="thang" />
        </div>
          <label>Người tạo:</label>
          <input name="nguoiTao" value={form.nguoiTao} onChange={handleChange} />
        <div></div>
          <label>Lớp:</label>
          <input name="lop" value={form.lop} onChange={handleChange} />
        <div></div>

        <div className="button-row">
          {/* Link sang trang tạo báo cáo mới */}
          <Link to="/create" className="btn">Tạo mới</Link>
          <button className="btn">Tìm kiếm</button>
        </div>
      </div>
    </div>
  );
}

export default Report;
