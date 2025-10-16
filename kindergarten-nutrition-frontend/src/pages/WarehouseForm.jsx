import React, { useState } from 'react';
import Header from '../components/common/Header.jsx';
import '../styles/WarehouseForm.css';
import '../styles/background.css';

function WarehouseForm({ initialData = {}, readOnly = false, onCancel }) {
  const [form, setForm] = useState({
    loaiNguyenLieu: initialData.nguyen_lieu || '',
    nguyenLieuConTon: initialData.nguyen_lieu_ton || '',
    tinhTrang: initialData.tinh_trang || '',
    sucChua: initialData.suc_chua_toi_da || '',
    ngayNhap: initialData.ngay_cap_nhat ? initialData.ngay_cap_nhat.slice(0, 16) : '',
    ngayRa: initialData.ngay_xuat ? initialData.ngay_xuat.slice(0, 16) : '',
    tongSoLuong: initialData.tong_so_luong || ''
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

  const handleSave = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/warehouse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage( data.message);
      handleReset();
    } else {
      setMessage( data.message);
    }
  } catch (error) {
    console.error('Lỗi khi gửi dữ liệu:', error);
    setMessage(" Không thể kết nối đến máy chủ");
  }

  setTimeout(() => setMessage(""), 3000);
};

  return (
    <div className="warehouse-page">
      {!readOnly && <Header />}
      <div className='warehouse-content'>
        <div className='form-box'>
          {readOnly && <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#333'}}>Chi tiết thông tin nguyên liệu</h2>}

          <label>Loại nguyên liệu</label>
          <input name="loaiNguyenLieu" value={form.loaiNguyenLieu} onChange={handleChange} disabled={readOnly} />
        <div></div>

          <label>Nguyên liệu còn tồn</label>
          <input name="nguyenLieuConTon" value={form.nguyenLieuConTon} onChange={handleChange} disabled={readOnly} />
        <div></div>

          <label>Tình trạng nguyên liệu</label>
          <input name="tinhTrang" value={form.tinhTrang} onChange={handleChange} disabled={readOnly} />
        <div></div>

          <label>Sức chứa còn lại</label>
          <input name="sucChua" value={form.sucChua} onChange={handleChange} disabled={readOnly} />
        <div></div>

          <label>Ngày giờ nhập</label>
          <input type="datetime-local" name="ngayNhap" value={form.ngayNhap} onChange={handleChange} disabled={readOnly} />
          <div></div>

          <label>Ngày giờ ra</label>
          <input type="datetime-local" name="ngayRa" value={form.ngayRa} onChange={handleChange} disabled={readOnly} />
          <div></div>
          
          <label>Tổng số lượng</label>
          <input name="tongSoLuong" value={form.tongSoLuong} onChange={handleChange} disabled={readOnly} />
          <div></div>
          

          <div className="button-group">
          {readOnly ? (
            <>
              <button onClick={handlePrint}>In phiếu</button>
              <button onClick={onCancel}>Đóng</button>
            </>
          ) : (
            <>
              <button onClick={handleReset}>Nhập mới</button>
              <button onClick={handlePrint}>In phiếu</button>
              <button onClick={handleSave}>Lưu</button>
            </>
          )}
        </div>

        {/* Thông báo */}
        {message && <p className="message">{message}</p>}

        </div>
        </div>
      </div>
  );
}

export default WarehouseForm;
