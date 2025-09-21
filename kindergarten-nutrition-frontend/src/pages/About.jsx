import React from 'react';
import Header from '../components/common/Header.jsx';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <Header />
      <div className="about-container">
        <div className="about-content">
          <h1>Giới thiệu về Trường Mầm Non ABC</h1>
          
          <section className="intro-section">
            <h2>Tầm nhìn</h2>
            <p>
              Trường Mầm Non ABC cam kết mang đến môi trường giáo dục chất lượng cao, 
              nuôi dưỡng sự phát triển toàn diện của trẻ em từ 1-6 tuổi.
            </p>
          </section>

          <section className="mission-section">
            <h2>Sứ mệnh</h2>
            <p>
              Chúng tôi tập trung vào việc phát triển kỹ năng xã hội, trí tuệ và thể chất 
              của trẻ em thông qua các hoạt động học tập và vui chơi phù hợp.
            </p>
          </section>

          <section className="nutrition-section">
            <h2>Dinh dưỡng học đường</h2>
            <p>
              Hệ thống quản lý dinh dưỡng hiện đại giúp theo dõi và đảm bảo chế độ ăn 
              cân bằng, phù hợp với từng độ tuổi và tình trạng sức khỏe của trẻ.
            </p>
          </section>

          <section className="features-section">
            <h2>Đặc điểm nổi bật</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>🍎 Dinh dưỡng cân bằng</h3>
                <p>Thực đơn được thiết kế bởi chuyên gia dinh dưỡng</p>
              </div>
              <div className="feature-card">
                <h3>👩‍⚕️ Theo dõi sức khỏe</h3>
                <p>Pantry dõi tình trạng sức khỏe và phát triển của trẻ</p>
              </div>
              <div className="feature-card">
                <h3>👨‍👩‍👧‍👦 Kết nối phụ huynh</h3>
                <p>Hệ thống thông tin minh bạch với phụ huynh</p>
              </div>
              <div className="feature-card">
                <h3>🏥 An toàn thực phẩm</h3>
                <p>Kiểm soát chất lượng và nguồn gốc thực phẩm</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;