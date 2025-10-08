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

    const [tempChildInfo, setTempChildInfo] = useState({ ...childInfo });
    const [isEditing, setIsEditing] = useState(false);

    // State BMI
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [bmi, setBmi] = useState(null);

    // State tình trạng sức khỏe
    const [healthStatus, setHealthStatus] = useState({
        hasAllergy: false,
        hasChronicDisease: false,
        hasMedication: false,
        hasSpecialDiet: false
    });

    // State dị ứng
    const [allergies, setAllergies] = useState([]);
    const [newAllergy, setNewAllergy] = useState("");

    // Xử lý thay đổi thông tin bé
    const handleChildChange = (e) => {
        const { name, value } = e.target;
        if (isEditing) {
            setTempChildInfo(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setChildInfo(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Tính BMI
    const calculateBMI = () => {
        if (weight && height) {
            const heightInMeters = parseFloat(height) / 100;
            const weightInKg = parseFloat(weight);
            const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);
            setBmi(calculatedBMI.toFixed(1));
        }
    };

    // Xử lý checkbox tình trạng sức khỏe
    const handleHealthStatusChange = (key) => {
        setHealthStatus(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Thêm dị ứng
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

    const handleSaveChildInfo = () => {
        setChildInfo({ ...tempChildInfo });
        setIsEditing(false);
        console.log("Thông tin học sinh đã lưu:", tempChildInfo);
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
                                value={isEditing ? tempChildInfo.name : childInfo.name}
                                onChange={handleChildChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="dob">Ngày sinh:</label>
                            <input
                                id="dob"
                                type="date"
                                name="dob"
                                value={isEditing ? tempChildInfo.dob : childInfo.dob}
                                onChange={handleChildChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="className">Lớp:</label>
                            <input
                                id="className"
                                type="text"
                                name="className"
                                placeholder="Nhập lớp"
                                value={isEditing ? tempChildInfo.className : childInfo.className}
                                onChange={handleChildChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="parentName">Tên phụ huynh:</label>
                            <input
                                id="parentName"
                                type="text"
                                name="parentName"
                                placeholder="Nhập tên phụ huynh"
                                value={isEditing ? tempChildInfo.parentName : childInfo.parentName}
                                onChange={handleChildChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="phone">Số điện thoại:</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                placeholder="Nhập số điện thoại"
                                value={isEditing ? tempChildInfo.phone : childInfo.phone}
                                onChange={handleChildChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>

                <div className="header-buttons">
                    <button
                        className="edit"
                        onClick={() => {
                            if (isEditing) {
                                setTempChildInfo({ ...childInfo });
                            } else {
                                setTempChildInfo({ ...childInfo });
                            }
                            setIsEditing(!isEditing);
                        }}
                    >
                        {isEditing ? "Hủy" : "Sửa thông tin"}
                    </button>

                    {isEditing && (
                        <button
                            className="save"
                            onClick={handleSaveChildInfo}
                        >
                            Lưu thông tin
                        </button>
                    )}
                </div>

                {/* Form sections */}
                <div className="form-sections">
                    {/* BMI */}
                    <div className="card">
                        <h3>Tính BMI của trẻ</h3>
                        <div className="form-row">
                            <label htmlFor="weight">Cân nặng (kg):</label>
                            <input
                                id="weight"
                                type="number"
                                min="1"
                                max="200"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Nhập cân nặng"
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="height">Chiều cao (cm):</label>
                            <input
                                id="height"
                                type="number"
                                min="30"
                                max="250"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="Nhập chiều cao"
                            />
                        </div>

                        <button onClick={calculateBMI}>Tính BMI</button>

                        {bmi && (
                            <div className="bmi-result">
                                <p>BMI: <strong>{bmi}</strong></p>
                            </div>
                        )}
                    </div>

                    {/* Tình trạng sức khỏe */}
                    <div className="card">
                        <h3>Tình trạng sức khỏe</h3>
                        <div className="checkbox-field">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={healthStatus.hasAllergy}
                                    onChange={() => handleHealthStatusChange('hasAllergy')}
                                />
                                Có dị ứng
                            </label>
                        </div>
                        <div className="checkbox-field">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={healthStatus.hasChronicDisease}
                                    onChange={() => handleHealthStatusChange('hasChronicDisease')}
                                />
                                Có bệnh mãn tính
                            </label>
                        </div>
                    </div>

                    {/* Dị ứng */}
                    <div className="card">
                        <h3>Dị ứng</h3>
                        <div className="allergy-input">
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tên dị ứng"
                            />
                            <button onClick={handleAddAllergy}>Thêm</button>
                        </div>

                        <div className="tags">
                            {allergies.map((allergy, index) => (
                                <span key={index} className="tag">
                                    {allergy}
                                    <button onClick={() => {
                                        setAllergies(allergies.filter((_, i) => i !== index));
                                    }}>×</button>
                                </span>
                            ))}
                        </div>
                        <button>Lưu</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthManager;