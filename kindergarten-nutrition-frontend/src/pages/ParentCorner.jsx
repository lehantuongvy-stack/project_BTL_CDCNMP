import React, { useState } from 'react';
import Header from '../components/common/Header.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import parentFeedbackService from '../services/parentFeedbackService.js';
import '../styles/ParentCorner.css';

const ParentCorner = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tieu_de: '',
    noi_dung: '',
    danh_gia_sao: 5
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gửi ý kiến phụ huynh
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.noi_dung.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung ý kiến' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const feedbackData = {
        tieu_de: formData.tieu_de || 'Ý kiến phụ huynh',
        noi_dung: formData.noi_dung,
        danh_gia_sao: parseInt(formData.danh_gia_sao) || 5
      };

      const response = await parentFeedbackService.createFeedback(feedbackData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Gửi ý kiến thành công! Cảm ơn bạn đã phản hồi.' });
        setFormData({ tieu_de: '', noi_dung: '', danh_gia_sao: 5 });
      } else {
        setMessage({ type: 'error', text: response.message || 'Gửi ý kiến thất bại.' });
      }
    } catch (error) {
      console.error('Lỗi gửi ý kiến:', error);
      setMessage({ type: 'error', text: 'Không thể gửi ý kiến. Vui lòng thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-corner-page">
      <Header />
      <div className="parent-corner-container">
        <div className="parent-corner-content">
          <h1>Góc Phụ Huynh</h1>

          {/* --- KHU VỰC GỬI Ý KIẾN --- */}
          <section className="feedback-section">
            <h2 style={{color: '#ffced2'}}>Gửi ý kiến đến nhà trường</h2>
            <p style={{color: 'black'}}>Chúng tôi luôn lắng nghe mọi góp ý và phản hồi từ quý phụ huynh ❤️</p>

            {message.text && (
              <div
                className={`feedback-message ${message.type}`}
                style={{
                  backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: message.type === 'success' ? '#388e3c' : '#d32f2f',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontWeight: '500'
                }}
              >
                {message.text}
              </div>
            )}

            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  name="tieu_de"
                  placeholder="Nhập tiêu đề (tuỳ chọn)"
                  value={formData.tieu_de}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Nội dung ý kiến *</label>
                <textarea
                  name="noi_dung"
                  placeholder="Nhập ý kiến của bạn..."
                  value={formData.noi_dung}
                  onChange={handleChange}
                  rows={5}
                  disabled={loading}
                ></textarea>
              </div>

              <div className="form-group rating-group">
                <label>Đánh giá (sao)</label>
                <select
                  name="danh_gia_sao"
                  value={formData.danh_gia_sao}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {[5, 4, 3, 2, 1].map(star => (
                    <option key={star} value={star}>
                      {`${'⭐'.repeat(star)} (${star})`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Đang gửi...' : 'Gửi ý kiến'}
              </button>
            </form>
          </section>

          {/* --- CÁC MỤC KHÁC --- */}
          <section className="contact-info">
            <h3>Thông tin liên hệ</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <h4>Hotline</h4>
                <p>(08) 38.000.000</p>
              </div>
              <div className="contact-item">
                <h4>Email</h4>
                <p>info@kindergarten-abc.edu.vn</p>
              </div>
              <div className="contact-item">
                <h4>Giờ làm việc</h4>
                <p>Thứ 2 - Thứ 6: 7:00 - 17:00</p>
              </div>
              <div className="contact-item">
                <h4>Địa chỉ</h4>
                <p>Số 18 Phố Viên</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ParentCorner;
