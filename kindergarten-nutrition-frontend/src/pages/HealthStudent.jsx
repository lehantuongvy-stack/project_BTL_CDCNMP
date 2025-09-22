import React, { useState } from "react";
import "./../styles/HealthManager.css";
import "../styles/background.css";
import BackButton from "../components/BackButton";

const HealthStudent = () => {
  // State thông tin bé
  const [childInfo] = useState({
    name: "Nguyễn Văn A",
    dob: "2020-05-10",
    className: "Mẫu giáo lớn",
    parentName: "Nguyễn Văn B",
    phone: "0901234567",
  });

  // State dị ứng
  const [allergies, setAllergies] = useState(["Trứng", "Đậu phộng"]);
  const [newAllergy, setNewAllergy] = useState("");

  // State mức độ ăn
  const [mealPercent] = useState(80);

  // State BMI
  const [weight] = useState(16); // kg
  const [height] = useState(100); // cm
  const [bmi] = useState(16.0);
  const [bmiCategory] = useState("Bình thường");
  const [gender] = useState("male");
  const [ageMonths] = useState(52);

  // Gợi ý nhanh
  const quickSuggestions = ["Mè (vừng)", "Trứng", "Hải sản", "Lúa mì", "Đậu nành", "Đậu phộng"];

  // Hàm thêm dị ứng
  const handleAddAllergy = () => {
    if (newAllergy.trim() !== "" && !allergies.includes(newAllergy)) {
      setAllergies([...allergies, newAllergy]);
      setNewAllergy("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAllergy();
    }
  };

  // Hàm render Thông tin bé
  const renderChildInfo = (info) => (
    <div className="info-box">
      <p><b>Thông tin bé</b></p>
      <div className="form-row">
        <label>Họ và tên:</label>
        <input type="text" value={info.name} disabled />
      </div>
      <div className="form-row">
        <label>Ngày sinh:</label>
        <input type="date" value={info.dob} disabled />
      </div>
      <div className="form-row">
        <label>Lớp:</label>
        <input type="text" value={info.className} disabled />
      </div>
      <div className="form-row">
        <label>Tên phụ huynh:</label>
        <input type="text" value={info.parentName} disabled />
      </div>
      <div className="form-row">
        <label>Số điện thoại:</label>
        <input type="tel" value={info.phone} disabled />
      </div>
    </div>
  );

  // Hàm render BMI
  const renderBMI = () => (
    <div className="card">
      <h3>Tính BMI của trẻ</h3>
      <div className="form-row">
        <label htmlFor="weight">Cân nặng (kg):</label>
        <input id="weight" type="number" value={weight} disabled />
      </div>
      <div className="form-row">
        <label htmlFor="height">Chiều cao (cm):</label>
        <input id="height" type="number" value={height} disabled />
      </div>
      <div className="form-row">
        <label htmlFor="gender">Giới tính:</label>
        <select id="gender" value={gender} disabled>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="ageMonths">Tuổi (tháng):</label>
        <input id="ageMonths" type="number" value={ageMonths} disabled />
      </div>
      {bmi && (
        <p>
          👉 BMI của bé là <b>{bmi}</b> ({bmiCategory})
        </p>
      )}
    </div>
  );

  // Hàm render Ghi chú bữa ăn
  const renderMealNote = (note) => (
    <div className="form-row">
      <h3>Ghi chú bữa ăn:</h3>
      <textarea id="mealNote" value={note} disabled rows={3} />
    </div>
  );

  // Hàm render Ăn uống
  const renderMeal = () => (
    <div className="card">
      <h3>Bé có ăn tại trường hôm nay?</h3>
      <input type="date" value="2025-09-20" disabled />
      <div className="checkbox-field">
        <input type="checkbox" checked disabled />
        <label>Đã ăn tại trường</label>
      </div>

      <h3>Mức độ ăn (ước lượng % khẩu phần)</h3>
      <input type="range" min="0" max="100" step="5" value={mealPercent} disabled />
      <p>👉 Bé đã ăn khoảng <b>{mealPercent}%</b></p>

      {renderMealNote("Ăn hết cơm, uống 150ml sữa")}
    </div>
  );

  // Hàm render Dị ứng
  const renderAllergies = () => (
    <div className="card">
      <h3>Bé bị dị ứng với:</h3>
      <div className="allergy-input">
        <input
          type="text"
          placeholder="Nhập và nhấn Enter"
          value={newAllergy}
          onChange={(e) => setNewAllergy(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleAddAllergy}>+ Thêm</button>
      </div>

      {allergies.length > 0 ? (
        <div className="tags" >
          <h3 style={{ marginTop: "15px" }}>Danh sách dị ứng</h3>
      
          {allergies.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </div>
      ) : (
        <p>Không có dị ứng</p>
      )}

      <h3 style={{ marginTop: "15px" }}>Gợi ý nhanh</h3>
      <div className="tags">
        {quickSuggestions.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="health-container home">
      <div className="header">
        <BackButton />
        <div className="title-box">QUẢN LÝ SỨC KHỎE</div>
        {renderChildInfo(childInfo)}
      </div>

      <div className="form-sections">
        {renderBMI()}
        {renderMeal()}
        {renderAllergies()}
      </div>
    </div>
  );
};

export default HealthStudent;
