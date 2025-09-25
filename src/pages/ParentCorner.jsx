import React from 'react';
import Header from '../components/common/Header.jsx';
import '../styles/ParentCorner.css';

const ParentCorner = () => {
  return (
    <div className="parent-corner-page">
      <Header />
      <div className="parent-corner-container">
        <div className="parent-corner-content">
          <h1>Góc Phụ Huynh</h1>
          
          <section className="welcome-section">
            <h2>Chào mừng các bậc phụ huynh!</h2>
            <p>
              Đây là khu vực dành riêng cho phụ huynh để theo dõi và cập nhật thông tin 
              về con em mình tại trường mầm non.
            </p>
          </section>

          <div className="parent-features">
            <div className="feature-category">
              <h3>📊 Theo dõi dinh dưỡng</h3>
              <div className="feature-list">
                <div className="feature-item">
                  <h4>Thực đơn hằng ngày</h4>
                  <p>Xem thực đơn chi tiết cho từng bữa ăn của con</p>
                </div>
                <div className="feature-item">
                  <h4>Báo cáo dinh dưỡng</h4>
                  <p>Theo dõi lượng dinh dưỡng con đã tiêu thụ</p>
                </div>
                <div className="feature-item">
                  <h4>Allergies & Tình trạng đặc biệt</h4>
                  <p>Quản lý thông tin dị ứng và tình trạng sức khỏe</p>
                </div>
              </div>
            </div>

            <div className="feature-category">
              <h3>👶 Thông tin trẻ em</h3>
              <div className="feature-list">
                <div className="feature-item">
                  <h4>Hồ sơ sức khỏe</h4>
                  <p>Theo dõi tình trạng sức khỏe và phát triển</p>
                </div>
                <div className="feature-item">
                  <h4>Cập nhật thông tin</h4>
                  <p>Cập nhật thông tin cá nhân và liên hệ</p>
                </div>
                <div className="feature-item">
                  <h4>Lịch sử hoạt động</h4>
                  <p>Xem lịch sử các hoạt động của con tại trường</p>
                </div>
              </div>
            </div>

            <div className="feature-category">
              <h3>📞 Liên hệ & Hỗ trợ</h3>
              <div className="feature-list">
                <div className="feature-item">
                  <h4>Liên hệ giáo viên</h4>
                  <p>Trao đổi trực tiếp với giáo viên chủ nhiệm</p>
                </div>
                <div className="feature-item">
                  <h4>Phản hồi thực đơn</h4>
                  <p>Góp ý về thực đơn và chất lượng bữa ăn</p>
                </div>
                <div className="feature-item">
                  <h4>Hỗ trợ kỹ thuật</h4>
                  <p>Hướng dẫn sử dụng hệ thống và giải đáp thắc mắc</p>
                </div>
              </div>
            </div>
          </div>

          <section className="quick-actions">
            <h3>Thao tác nhanh</h3>
            <div className="action-buttons">
              <button className="action-btn primary">
                📋 Xem thực đơn hôm nay
              </button>
              <button className="action-btn secondary">
                📊 Báo cáo dinh dưỡng
              </button>
              <button className="action-btn tertiary">
                👤 Cập nhật thông tin con
              </button>
              <button className="action-btn quaternary">
                💬 Liên hệ giáo viên
              </button>
            </div>
          </section>

          <section className="contact-info">
            <h3>Thông tin liên hệ</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <h4>📞 Hotline</h4>
                <p>(08) 38.000.000</p>
              </div>
              <div className="contact-item">
                <h4>📧 Email</h4>
                <p>info@kindergarten-abc.edu.vn</p>
              </div>
              <div className="contact-item">
                <h4>🕒 Giờ làm việc</h4>
                <p>Thứ 2 - Thứ 6: 7:00 - 17:00</p>
              </div>
              <div className="contact-item">
                <h4>📍 Địa chỉ</h4>
                <p>123 Đường ABC, Quận XYZ, TP.HCM</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ParentCorner;