import React, { useState } from "react";
import Header from '../components/common/Header.jsx';
import "./../styles/HealthManager.css";
import "../styles/background.css";

const HealthManager = () => {
    // State thông tin bé
    const [childInfo, setChildInfo] = useState({
        name: "",
        dob: "",
        className: "",
        parentName: "",
        phone: ""
    });


    // State dị ứng
    const [allergies, setAllergies] = useState([]);
    const [newAllergy, setNewAllergy] = useState("");

    // State mức độ ăn
    const [mealPercent, setMealPercent] = useState(0);

    // State BMI
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [bmiCategory, setBmiCategory] = useState("");

    const [gender, setGender] = useState("");
    const [ageMonths, setAgeMonths] = useState("");



    // Gợi ý nhanh
    const quickSuggestions = ["Mè (vừng)", "Trứng", "Hải sản", "Lúa mì", "Đậu nành", "Đậu phộng"];

    // Hàm xử lý thay đổi input
    const handleChildChange = (e) => {
        const { name, value } = e.target;
        setChildInfo({ ...childInfo, [name]: value });
    };

    // Hàm tính BMI
    const calculateBMI = () => {
        if (!weight || !height) return;

        const hMeters = Number(height) / 100; // đổi cm sang m
        const bmiValue = Number(weight) / (hMeters * hMeters);
        setBmi(bmiValue.toFixed(1));

        // phân loại tạm (người lớn)
        if (bmiValue < 18.5) setBmiCategory("Gầy");
        else if (bmiValue < 25) setBmiCategory("Bình thường");
        else if (bmiValue < 30) setBmiCategory("Thừa cân");
        else setBmiCategory("Béo phì");

        console.log("Giới tính:", gender, "Tuổi (tháng):", ageMonths);
    };



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

    return (
        <div className="health-manager-page">
            <Header />
            <div className="health-container">
                <div className="header">
                    <div className="title-box">QUẢN LÝ SỨC KHỎE</div>
                    <div className="info-box">
                    <p><b>Thông tin bé</b></p>

                    <div className="form-row">
                        <label htmlFor="childName">Họ và tên:</label>
                        <input
                            id="childName"
                            type="text"
                            name="name"
                            placeholder="Nhập họ và tên"
                            value={childInfo.name}
                            onChange={handleChildChange}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="childDob">Ngày sinh:</label>
                        <input
                            id="childDob"
                            type="date"
                            name="dob"
                            value={childInfo.dob}
                            onChange={handleChildChange}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="childClass">Lớp:</label>
                        <input
                            id="childClass"
                            type="text"
                            name="className"
                            placeholder="Nhập lớp"
                            value={childInfo.className}
                            onChange={handleChildChange}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="parentName">Tên phụ huynh:</label>
                        <input
                            id="parentName"
                            type="text"
                            name="parentName"
                            placeholder="Nhập tên phụ huynh"
                            value={childInfo.parentName}
                            onChange={handleChildChange}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="phone">Số điện thoại:</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            placeholder="Nhập số điện thoại"
                            value={childInfo.phone}
                            onChange={handleChildChange}
                        />
                    </div>

                </div>


                {/* <div className="icon-box"></div> */}
            </div>

            <div className="hm-cards-container">
                {/* BMI */}
                <div className="hm-card">
                    <h3>Tính BMI của trẻ</h3>
                    <input
                        type="number"
                        placeholder="Cân nặng (kg)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Chiều cao (cm)"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                    />

                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Tuổi (tháng)"
                        value={ageMonths}
                        onChange={(e) => setAgeMonths(e.target.value)}
                    />


                    <div className="btn-group">
                        <button onClick={calculateBMI}>Lưu </button>
                        <button
                            className="danger"
                            onClick={() => { setWeight(""); setHeight(""); setBmi(null); }}
                        >
                            Xóa
                        </button>
                    </div>


                    {bmi && (
                        <p>
                             BMI của bé là <b>{bmi}</b> ({bmiCategory})
                        </p>
                    )}

                </div>

                {/* Ăn uống */}
                <div className="hm-card">
                    <h3>Bé có ăn tại trường hôm nay?</h3>
                    <input type="date" defaultValue="2025-08-19" />
                    <div className="checkbox-field">
                        <input type="checkbox" id="eatAtSchool" />
                        <label htmlFor="eatAtSchool">Đã ăn tại trường</label>
                    </div>

                    <h3>Mức độ ăn (ước lượng % khẩu phần)</h3>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={mealPercent}
                        onChange={(e) => setMealPercent(Number(e.target.value))}
                    />
                    <p> Bé đã ăn khoảng <b>{mealPercent}%</b></p>

                    <h3>Ghi chú bữa ăn</h3>
                    <textarea placeholder="(vd: ăn hết cơm, uống 120ml sữa)"></textarea>
                </div>

                {/* Dị ứng */}
                <div className="hm-card">
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
                                    <span key={index}>{item}</span>
                                ))}
                            </div>
                        </>
                    )}

                    <h3 style={{ marginTop: "15px" }}>Gợi ý nhanh</h3>
                    <div className="tags">
                        {quickSuggestions.map((item, index) => (
                            <span key={index}>{item}</span>
                        ))}
                    </div>

                    <button>Lưu </button>
                </div>
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
          <button>Lưu</button>

        </div>
    );
};

export default HealthManager; 
