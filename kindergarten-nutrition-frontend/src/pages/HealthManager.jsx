import React, { useState } from "react";
import "./../styles/HealthManager.css";
import "../styles/background.css";
import BackButton from "../components/BackButton";

// --- Dữ liệu mặc định ---
const DEFAULT_CHILD_INFO = {
  name: "Nguyễn Văn A",
  dob: "2019-05-10",
  className: "Lớp 1A",
  parentName: "Nguyễn Thị B",
  phone: "0123456789"
};

const DEFAULT_BMI = {
  weight: 16, // kg
  height: 100, // cm
  bmi: 16.0,
  bmiCategory: "Bình thường",
  gender: "male",
  ageMonths: 52
};

const DEFAULT_ALLERGIES = ["Trứng", "Đậu phộng"];

const QUICK_SUGGESTIONS = ["Mè (vừng)", "Trứng", "Hải sản", "Lúa mì", "Đậu nành", "Đậu phộng"];

const HealthManager = () => {
  // --- Thông tin học sinh ---
  const [childInfo, setChildInfo] = useState(DEFAULT_CHILD_INFO);
  const [tempChildInfo, setTempChildInfo] = useState(childInfo);
  const [isEditing, setIsEditing] = useState(false);

  // --- BMI ---
  const [weight, setWeight] = useState(DEFAULT_BMI.weight);
  const [height, setHeight] = useState(DEFAULT_BMI.height);
  const [bmi, setBmi] = useState(DEFAULT_BMI.bmi);
  const [bmiCategory, setBmiCategory] = useState(DEFAULT_BMI.bmiCategory);
  const [gender, setGender] = useState(DEFAULT_BMI.gender);
  const [ageMonths, setAgeMonths] = useState(DEFAULT_BMI.ageMonths);
  const [isEditingBMI, setIsEditingBMI] = useState(false);

  // --- Ăn uống ---
  const [ateAtSchool, setAteAtSchool] = useState(false);
  const [mealPercent, setMealPercent] = useState();
  const [mealNote, setMealNote] = useState("");

  // --- Dị ứng ---
  const [allergies, setAllergies] = useState(DEFAULT_ALLERGIES);
  const [newAllergy, setNewAllergy] = useState("");

  // State tạm thời
  const [tempBMI, setTempBMI] = useState({
    weight: weight,
    height: height,
    gender: gender,
    ageMonths: ageMonths
  });

  // --- Hàm xử lý ---
  const handleChildChange = (e) => {
    const { name, value } = e.target;
    setTempChildInfo({ ...tempChildInfo, [name]: value });
  };

  const calculateBMI = () => {
    // Nếu có trường nào null/undefined thì không tính
    if (!weight || !height || !gender || !ageMonths) {
      alert("Vui lòng nhập đầy đủ thông tin trước khi lưu BMI!");
      return;
    }

    const hMeters = Number(height) / 100;
    const bmiValue = Number(weight) / (hMeters * hMeters);
    setBmi(bmiValue.toFixed(1));

    if (bmiValue < 18.5) setBmiCategory("Gầy");
    else if (bmiValue < 25) setBmiCategory("Bình thường");
    else if (bmiValue < 30) setBmiCategory("Thừa cân");
    else setBmiCategory("Béo phì");

    // Sau khi lưu xong, tắt chế độ sửa
    setIsEditingBMI(false);
  };


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

  return (
    <div className="health-container home">
      {/* --- Header: thông tin học sinh --- */}
      <div className="header">
        <BackButton />
        <div className="title-box">QUẢN LÝ SỨC KHỎE</div>

        <div className="info-box">
          <p><b>Thông tin bé</b></p>
          <div className="form-row">
            <label>Họ và tên:</label>
            <input
              type="text"
              name="name"
              value={tempChildInfo.name}
              onChange={handleChildChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-row">
            <label>Ngày sinh:</label>
            <input
              type="date"
              name="dob"
              value={tempChildInfo.dob}
              onChange={handleChildChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-row">
            <label>Lớp:</label>
            <input
              type="text"
              name="className"
              value={tempChildInfo.className}
              onChange={handleChildChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-row">
            <label>Tên phụ huynh:</label>
            <input
              type="text"
              name="parentName"
              value={tempChildInfo.parentName}
              onChange={handleChildChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-row">
            <label>Số điện thoại:</label>
            <input
              type="tel"
              name="phone"
              value={tempChildInfo.phone}
              onChange={handleChildChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="header-buttons">
          <button
            className={isEditing ? "cancel" : "edit"}
            onClick={() => {
              if (isEditing) setTempChildInfo(childInfo); // Hủy -> quay về dữ liệu cũ
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? "Hủy" : "Sửa thông tin"}
          </button>

          {isEditing && (
            <button
              className="save"
              onClick={() => {
                setChildInfo({ ...tempChildInfo });
                setIsEditing(false);
                console.log("Thông tin học sinh đã lưu:", tempChildInfo);
              }}
            >
              Lưu thông tin
            </button>
          )}
        </div>
      </div>

      {/* --- Form sections --- */}
      <div className="form-sections">
        {/* --- BMI --- */}
        <div className="card">
          <h3>Tính BMI của trẻ</h3>

          <div className="form-row">
            <label htmlFor="weight">Cân nặng (kg):</label>
            <input
              id="weight"
              type="number"
              min="1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={!isEditingBMI}
            />
          </div>

          <div className="form-row">
            <label htmlFor="height">Chiều cao (cm):</label>
            <input
              id="height"
              type="number"
              min="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={!isEditingBMI}
            />
          </div>

          <div className="form-row">
            <label htmlFor="gender">Giới tính:</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={!isEditingBMI}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="ageMonths">Tuổi (tháng):</label>
            <input
              id="ageMonths"
              type="number"
              min="1"
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value)}
              disabled={!isEditingBMI}
            />
          </div>

          <div className="btn-group">
          
            <button
              onClick={() => {
                if (!weight || !height || !gender || !ageMonths) {
                  alert("Vui lòng nhập đầy đủ thông tin trước khi lưu BMI!");
                  return;
                }

                // Cập nhật tempBMI để lần sau sửa vẫn có giá trị chuẩn
                setTempBMI({ weight, height, gender, ageMonths });

                // Tính BMI
                const hMeters = Number(height) / 100;
                const bmiValue = Number(weight) / (hMeters * hMeters);
                setBmi(bmiValue.toFixed(1));

                if (bmiValue < 18.5) setBmiCategory("Gầy");
                else if (bmiValue < 25) setBmiCategory("Bình thường");
                else if (bmiValue < 30) setBmiCategory("Thừa cân");
                else setBmiCategory("Béo phì");

                setIsEditingBMI(false); // Khóa input, nút Hủy thành Sửa
              }}
            >
              Lưu
            </button>
           
            <button
              onClick={() => {
                if (isEditingBMI) {
                  // Hủy -> phục hồi giá trị từ tempBMI
                  setWeight(tempBMI.weight);
                  setHeight(tempBMI.height);
                  setGender(tempBMI.gender);
                  setAgeMonths(tempBMI.ageMonths);
                } else {
                  // Sửa -> lưu giá trị hiện tại vào tempBMI
                  setTempBMI({ weight, height, gender, ageMonths });
                }
                setIsEditingBMI(!isEditingBMI);
              }}
            >
              {isEditingBMI ? "Hủy" : "Sửa"}
            </button>
          </div>

          {bmi && (
            <p>
              👉 BMI của bé là <b>{bmi}</b> ({bmiCategory})
            </p>
          )}
        </div>

        {/* --- Ăn uống --- */}
        <div className="card">
          <h3>Bé có ăn tại trường hôm nay?</h3>
          <input
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
          />

          <div className="checkbox-field">
            <input
              type="checkbox"
              id="eatAtSchool"
              checked={ateAtSchool}
              onChange={(e) => setAteAtSchool(e.target.checked)}
            />
            <label htmlFor="eatAtSchool">Đã ăn tại trường</label>
          </div>

          <h3>Mức độ ăn (ước lượng % khẩu phần)</h3>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            onChange={(e) => setMealPercent(Number(e.target.value))}
          />
          <p>👉 Bé đã ăn khoảng <b>{mealPercent || 0}%</b></p>

          <h3>Ghi chú bữa ăn</h3>
          <textarea
            placeholder="Nhập ghi chú..."
            onChange={(e) => setMealNote(e.target.value)}
          ></textarea>

          <button
            onClick={() => {
              console.log("Thông tin ăn tại trường:", { ateAtSchool, mealPercent, mealNote });
              alert("Đã lưu thông tin ăn tại trường!");
            }}
          >
            Lưu
          </button>
        </div>

        {/* --- Dị ứng --- */}
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
          {allergies.length > 0 && (
            <>
              <h3 style={{ marginTop: "15px" }}>Danh sách dị ứng</h3>
              <div className="tags">
                {allergies.map((item, index) => (
                  <span key={index}>
                    {item}{" "}
                    <button
                      onClick={() => setAllergies(allergies.filter((_, i) => i !== index))}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </>
          )}
          <h3 style={{ marginTop: "15px" }}>Gợi ý nhanh</h3>
          <div className="tags">
            {QUICK_SUGGESTIONS.map((item) => (
              <span
                key={item}
                onClick={() => {
                  if (!allergies.includes(item)) setAllergies([...allergies, item]);
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthManager;
