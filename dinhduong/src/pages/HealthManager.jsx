import React, { useState } from "react";
import "./../styles/HealthManager.css";
import "../styles/background.css";

const HealthManager = () => {
    // State để quản lý danh sách dị ứng người nhập
    const [allergies, setAllergies] = useState([]);
    const [newAllergy, setNewAllergy] = useState("");

    // Gợi ý nhanh (cố định)
    const quickSuggestions = [
        "Mè (vừng)",
        "Trứng",
        "Hải sản",
        "Lúa mì",
        "Đậu nành",
        "Đậu phộng",
    ];

    // Xử lý khi bấm nút thêm
    const handleAddAllergy = () => {
        if (newAllergy.trim() !== "" && !allergies.includes(newAllergy)) {
            setAllergies([...allergies, newAllergy]);
            setNewAllergy(""); // clear input
        }
    };

    // Xử lý khi bấm Enter trong input
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
                    <p>Họ và tên: </p>
                    <p>Ngày sinh: </p>
                    <p>Lớp: </p>
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
                    <input type="range" min="0" max="100" step="5" />
                    <h3>Ghi chú bữa ăn</h3>
                    <textarea placeholder="(vd: ăn hết cơm, uống 120ml sữa)"></textarea>
                    <button>Lưu số liệu</button>
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

                    {/* Danh sách dị ứng đã thêm */}
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


                    {/* Gợi ý nhanh */}
                    <h3 style={{ marginTop: "15px" }}>Gợi ý nhanh</h3>
                    <div className="tags">
                        {quickSuggestions.map((item, index) => (
                            <span key={index}>{item}</span>
                        ))}
                    </div>

                    <button>Lưu số liệu</button>
                </div>
            </div>
        </div >
    );
};

export default HealthManager;
