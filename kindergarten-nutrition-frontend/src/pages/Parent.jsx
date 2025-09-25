import React, { useState } from "react";
import "../styles/Parent.css";
import '../styles/background.css';
import BackButton from  '../components/BackButton';

function Parent() {
  const [satisfaction, setSatisfaction] = useState({
    giaoVien: false,
    coSoVatChat: false,
    chedodinhduong: false,
  });

  const [feedback, setFeedback] = useState("");

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSatisfaction({ ...satisfaction, [name]: checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Mức độ hài lòng:", satisfaction);
    console.log("Ý kiến:", feedback);
    alert("Cảm ơn phụ huynh đã gửi phản hồi!");
  };

  return (
    <div className="home">
      <BackButton />
      <h2>GÓC PHỤ HUYNH</h2>

      <form onSubmit={handleSubmit}>
        <div className="survey-box">
          <h3>Mức độ hài lòng của phụ huynh</h3>

          {/* Giáo viên */}
          <div className="survey-group">
            <label><b>Giáo viên</b></label>
            <div>
              <label>
                <input type="radio" name="giaovien" value="tot" /> Tốt
              </label>
              <label>
                <input type="radio" name="giaovien" value="trungbinh" /> Trung bình
              </label>
              <label>
                <input type="radio" name="giaovien" value="khongtot" /> Không tốt
              </label>
            </div>
          </div>

          {/* Cơ sở vật chất */}
          <div className="survey-group">
            <label><b>Cơ sở vật chất</b></label>
            <div>
              <label>
                <input type="radio" name="cosovatchat" value="tot" /> Tốt
              </label>
              <label>
                <input type="radio" name="cosovatchat" value="trungbinh" /> Trung bình
              </label>
              <label>
                <input type="radio" name="cosovatchat" value="khongtot" /> Không tốt
              </label>
            </div>
          </div>

          {/* Chế độ dinh dưỡng */}
          <div className="survey-group">
            <label><b>Chế độ dinh dưỡng</b></label>
            <div>
              <label>
                <input type="radio" name="dinhduong" value="tot" /> Tốt
              </label>
              <label>
                <input type="radio" name="dinhduong" value="trungbinh" /> Trung bình
              </label>
              <label>
                <input type="radio" name="dinhduong" value="khongtot" /> Không tốt
              </label>
            </div>
          </div>
    </div>

        <div className="feedback-section">
          <h3>Thêm ý kiến</h3>
          <textarea
            placeholder="Nhập ý kiến"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn">
          Gửi phản hồi
        </button>
      </form>
    </div>
  );
}

export default Parent;
