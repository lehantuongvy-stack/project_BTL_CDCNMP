import React, { useState } from "react";
import "./../styles/HealthManager.css";
import "../styles/background.css";

const HealthManager = () => {
    // State thông tin bé
    const [childInfo, setChildInfo] = useState({
        name: "",
        dob: "",
        className: "",
    });

    // State dị ứng
    const [allergies, setAllergies] = useState([]);
    const [newAllergy, setNewAllergy] = useState("");

    // State mức độ ăn
    const [mealPercent, setMealPercent] = useState(0);

    // Gợi ý nhanh
    const quickSuggestions = ["Mè (vừng)", "Trứng", "Hải sản", "Lúa mì", "Đậu nành", "Đậu phộng"];

    // Hàm xử lý thay đổi input
    const handleChildChange = (e) => {
        const { name, value } = e.target;
        setChildInfo({ ...childInfo, [name]: value });
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
        <div className="health-container home">
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
                </div>


                <div className="icon-box">🐰</div>
            </div>

            <div className="form-sections">
                {/* BMI */}
                <div className="card">
                    <h3>Tính BMI của trẻ</h3>
                    <input type="text" placeholder="Cân nặng (kg) vd. 14.5" />
                    <input type="text" placeholder="Chiều cao (cm) vd. 95" />
                    <select>
                        <option>Giới tính</option>
                        <option>Nam</option>
                        <option>Nữ</option>
                    </select>
                    <input type="text" placeholder="Tuổi (tháng) vd. 48" />
                    <div className="btn-group">
                        <button>Lưu số liệu</button>
                        <button className="danger">Xóa</button>
                    </div>
                </div>

                {/* Ăn uống */}
                <div className="card">
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
                    <p>👉 Bé đã ăn khoảng <b>{mealPercent}%</b></p>

                    <h3>Ghi chú bữa ăn</h3>
                    <textarea placeholder="(vd: ăn hết cơm, uống 120ml sữa)"></textarea>
                </div>

                {/* Dị ứng */}
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

                    <button>Lưu số liệu</button>
                </div>
            </div>
        </div>
    );
};

export default HealthManager;
