import React, { useState } from 'react';
import header from "./components/header/header";
import "./report.css";

function App() {

  const [form, setForm] = useState({
    tenBaocao: '',
    nguoiTao: '',
    lop: '',
    thang: ''
  });

  const handleBack = () => {
    window.location.href = "/";


   const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <div className="header">
        <button className="back-btn" onClick={handleBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="white"
            viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="title-box">BÁO CÁO</div>
      </div>

      <div className="form-box">
        <div>
          <label>Tên báo cáo:</label>
          <input name="tenBaocao" value={form.tenBaocao} onChange={handleChange} />
          <label>Tháng:</label>
          <input name="thang" value={form.thang} onChange={handleChange} />
        </div>
          <label>Người tạo:</label>
          <input name="nguoiTao" value={form.nguoiTao} onChange={handleChange} />
        <div></div>
          <label>Lớp:</label>
          <input name="lop" value={form.lop} onChange={handleChange} />
        <div></div>

        <div className="button-row">
          {/* Link sang trang tạo báo cáo mới */}
          <a href="/create" className="btn">Tạo mới</a>
          <button className="btn">Tìm kiếm</button>
        </div>
      </div>
    </div>
  );
}

export default App;
