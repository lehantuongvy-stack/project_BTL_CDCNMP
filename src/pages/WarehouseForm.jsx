import React, { useState } from 'react';
import Header from '../components/common/Header.jsx';
import '../styles/WarehouseForm.css';

function WarehouseForm() {
  const [form, setForm] = useState({
    loaiNguyenLieu: '',
    nguyenLieuConTon: '',
    tinhTrang: '',
    sucChua: '',
    ngayNhap: '',
    ngayRa: '',
    tongSoLuong: ''
  });

  const [message, setMessage] = useState("");


  //hàm nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  //hàm reset lại
  const handleReset = () => {
    setForm({
      loaiNguyenLieu: '',
      nguyenLieuConTon: '',
      tinhTrang: '',
      sucChua: '',
      ngayNhap: '',
      ngayRa: '',
      tongSoLuong: ''
    });
  };

  //hàm in
  const handlePrint = () => {
    window.print(); // đơn giản hóa việc in
  };

  const handleSave = () => {
    setMessage(" Lưu thông tin thành công!");
    setTimeout(() => setMessage(""), 3000); // 3s tự ẩn
  };

  return (
    <div className="warehouse-page">
      <Header />
      <div className='warehouse-content'>
        <div className='form-box'>

          <label>Loại nguyên liệu</label>
          <input name="loaiNguyenLieu" value={form.loaiNguyenLieu} onChange={handleChange} />
        <div></div>

          <label>Nguyên liệu còn tồn</label>
          <input name="nguyenLieuConTon" value={form.nguyenLieuConTon} onChange={handleChange} />
        <div></div>

          <label>Tình trạng nguyên liệu</label>
          <input name="tinhTrang" value={form.tinhTrang} onChange={handleChange} />
        <div></div>

          <label>Sức chứa còn lại</label>
          <input name="sucChua" value={form.sucChua} onChange={handleChange} />
        <div></div>

          <label>Ngày giờ nhập</label>
          <input type="datetime-local" name="ngayNhap" value={form.ngayNhap} onChange={handleChange} />
          <div></div>

          <label>Ngày giờ ra</label>
          <input type="datetime-local" name="ngayRa" value={form.ngayRa} onChange={handleChange} />
          <div></div>
          
          <label>Tổng số lượng</label>
          <input name="tongSoLuong" value={form.tongSoLuong} onChange={handleChange} />
          <div></div>
          

          <div className="button-group">
          <button onClick={handleReset}>Nhập mới</button>
          <button onClick={handlePrint}>In phiếu</button>
          <button onClick={handleSave}>Lưu</button>
          <button className='btn'>Tìm kiếm</button>
        </div>

        {/* Thông báo */}
        {message && <p className="message">{message}</p>}

        </div>
        </div>
      </div>
  );
}

export default WarehouseForm;
