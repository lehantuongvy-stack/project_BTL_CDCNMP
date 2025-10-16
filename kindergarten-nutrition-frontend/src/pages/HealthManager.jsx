import React, { useState, useEffect } from "react";
import Header from '../components/common/Header.jsx';
import "./../styles/HealthManager.css";
import "../styles/background.css";
import childService from '../services/childService.js';
import healthService from '../services/healthService.js';
import { useAuth } from '../context/AuthContext.jsx';

const HealthManager = () => {
    const { user } = useAuth(); // Lấy thông tin user đang đăng nhập
    
    // State danh sách children và child được chọn
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [loading, setLoading] = useState(true);

    // State thông tin chi tiết về bé
    const [eatingLevel, setEatingLevel] = useState("");
    const [activityLevel, setActivityLevel] = useState("");
    const [moodLevel, setMoodLevel] = useState("");
    const [mealNote, setMealNote] = useState("");
    const [recommendation, setRecommendation] = useState("");

    // State mức độ ăn
    const [mealPercent, setMealPercent] = useState(0);
    const [eatAtSchool, setEatAtSchool] = useState(false);

    // State BMI
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [bmiCategory, setBmiCategory] = useState(""); 

    // Load danh sách children theo lớp của teacher khi component mount
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                setLoading(true);
                
                // Nếu user là teacher, lấy children của lớp mình dạy
                if (user && user.role === 'teacher') {
                    const response = await childService.getMyClassChildren();
                    if (response && response.data && response.data.children) {
                        // Giới hạn tối đa 20 trẻ
                        const limitedChildren = response.data.children.slice(0, 20);
                        setChildren(limitedChildren);
                    }
                } else {
                    // Với các role khác, lấy tất cả children (có thể điều chỉnh logic sau)
                    const response = await childService.getAllChildren();
                    if (response && response.data && response.data.children) {
                        const limitedChildren = response.data.children.slice(0, 20);
                        setChildren(limitedChildren);
                    }
                }
            } catch (error) {
                console.error('Error fetching children:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchChildren();
        }
    }, [user]);

    // Hàm xử lý chọn child
    const handleSelectChild = (child) => {
        setSelectedChild(child);
        setWeight("");
        setHeight("");
        setBmi(null);
        setBmiCategory("");
        setMealPercent(0);
        setEatingLevel("");
        setActivityLevel("");
        setMoodLevel("");
        setMealNote("");
        setRecommendation("");
    };

    // Hàm tính BMI
    const calculateBMI = () => {
        if (!weight || !height) return;

        const hMeters = Number(height) / 100; // đổi cm sang m
        const bmiValue = Number(weight) / (hMeters * hMeters);
        setBmi(bmiValue.toFixed(1));

        // phân loại BMI cho trẻ em (tham khảo)
        if (bmiValue < 14) setBmiCategory("Gầy");
        else if (bmiValue < 18) setBmiCategory("Bình thường");
        else if (bmiValue < 22) setBmiCategory("Thừa cân");
        else setBmiCategory("Béo phì");
    };

    // Hàm thêm dị ứng
    const handleAddAllergy = () => {
        if (newAllergy.trim() !== "" && !allergies.includes(newAllergy)) {
            setAllergies([...allergies, newAllergy]);
            setNewAllergy("");
        }
    };

    // Hàm lưu thông tin chi tiết về bé
    const handleSaveChildDetails = () => {
        if (!selectedChild) return;
        
        const childDetails = {
            childId: selectedChild.id,
            eatingLevel,
            activityLevel,
            moodLevel,
            mealNote,
            recommendation,
            date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
        };
        
        console.log('Saving child details:', childDetails);
        // TODO: Gọi API để lưu thông tin
        alert('Đã lưu thông tin cho ' + (selectedChild.full_name || selectedChild.name));
    };

    // Hàm lưu tất cả đánh giá sức khỏe
    const handleSaveAllAssessment = async () => {
        if (!selectedChild) {
            alert('Vui lòng chọn một trẻ trước khi lưu!');
            return;
        }

        // Kiểm tra dữ liệu bắt buộc
        if (!weight || !height) {
            alert('Vui lòng nhập đầy đủ cân nặng và chiều cao!');
            return;
        }

        try {
            // Chuẩn bị dữ liệu đánh giá sức khỏe
            const currentDate = new Date().toISOString().split('T')[0];
            const assessmentData = {
                child_id: selectedChild?.child_id || selectedChild?.id,
                ngay_danh_gia: currentDate,
                
                // Thông số đo đạc (đảm bảo là số)
                chieu_cao: height ? parseFloat(height) : null,
                can_nang: weight ? parseFloat(weight) : null,
                
                // Đánh giá chi tiết - Các trường enum trong database
                an_uong: mapEatingLevel(eatingLevel) || 'good',
                hoat_dong: mapActivityLevel(activityLevel) || 'normal', 
                tinh_than: mapMoodLevel(moodLevel) || 'normal',
                
                // Ghi chú và khuyến cáo - mapping đúng field names trong database
                tinh_trang_suc_khoe: mealNote || '',
                khuyen_cao: recommendation || '',
                
                // Thông tin bổ sung
                ket_luan: `BMI: ${bmi || 'Chưa tính'} (${bmiCategory || 'Chưa phân loại'})`
            };

            console.log('Saving assessment data:', assessmentData);
            console.log('Data validation:', {
                hasChildId: !!assessmentData.child_id,
                hasDate: !!assessmentData.ngay_danh_gia,
                hasHeight: !!assessmentData.chieu_cao,
                hasWeight: !!assessmentData.can_nang
            });
            
            // Gọi API để lưu đánh giá
            const response = await healthService.createHealthAssessment(assessmentData);
            
            if (response.success) {
                alert(` Đã lưu đánh giá sức khỏe cho ${selectedChild.full_name || selectedChild.name} thành công!`);
                
                // Reset form sau khi lưu thành công
                setWeight("");
                setHeight("");
                setBmi(null);
                setBmiCategory("");
                setMealPercent(0);
                setEatingLevel("");
                setActivityLevel("");
                setMoodLevel("");
                setMealNote("");
                setRecommendation("");
            } else {
                alert(' Có lỗi khi lưu đánh giá: ' + response.message);
            }
            
        } catch (error) {
            console.error('Error saving assessment:', error);
            alert(' Có lỗi xảy ra khi lưu đánh giá sức khỏe!');
        }
    };

    // Helper functions để map values sang enum tiếng Việt trong database
    const mapEatingLevel = (level) => {
        const mapping = {
            'day-du': 'Đầy đủ',
            'vua-an': 'Vừa đủ', 
            'an-it': 'Ăn ít',
            'ken-an': 'Kén ăn'
        };
        return mapping[level] || 'Vừa đủ';
    };

    const mapActivityLevel = (level) => {
        const mapping = {
            'nang-dong': 'Năng động',
            'co-van-dong': 'Có vận động',
            'it-van-dong': 'Ít vận động'
        };
        return mapping[level] || 'Có vận động';
    };

    const mapMoodLevel = (level) => {
        const mapping = {
            'vui-ve': 'Vui vẻ',
            'binh-thuong': 'Bình thường',
            'buon': 'Buồn'
        };
        return mapping[level] || 'Bình thường';
    };

    return (
        <div className="health-manager-page">
            <Header />
            <div className="health-container">
                <div className="header">
                    <div className="title-box">QUẢN LÝ SỨC KHỎE</div>
                    <div className="info-box">
                        <p><b>Thông tin bé</b></p>
                        
                        {loading ? (
                            <div className="loading">Đang tải danh sách trẻ...</div>
                        ) : (
                            <div className="children-list">
                                {children.length > 0 ? (
                                    children.map((child) => (
                                        <div
                                            key={child.child_id || child.id}
                                            className={`child-box ${selectedChild && selectedChild.child_id === child.child_id ? 'selected' : ''}`}
                                            onClick={() => handleSelectChild(child)}
                                        >
                                            <span className="child-name">{child.full_name || child.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-children">Không có trẻ nào trong lớp của bạn</div>
                                )}
                            </div>
                        )}
                        
                        {selectedChild && (
                            <div className="selected-child-info">
                                <strong>Đã chọn: {selectedChild.full_name || selectedChild.name}</strong>
                                {selectedChild.class_name && (
                                    <span> - Lớp: {selectedChild.class_name}</span>
                                )}
                            </div>
                        )}
                    </div>


                {/* <div className="icon-box"></div> */}
            </div>

            <div className="hm-cards-container">
                {/* BMI */}
                <div className="hm-card">
                    <h3>Tính BMI của trẻ</h3>
                    {selectedChild ? (
                        <>
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
                        </>
                    ) : (
                        <p className="select-child-message">Vui lòng chọn một trẻ để tính BMI</p>
                    )}
                </div>

                {/* Ăn uống */}
                <div className="hm-card">
                    <h3>Bé có ăn tại trường hôm nay?</h3>
                    {selectedChild ? (
                        <>
                            <input type="date" defaultValue="2025-08-19" />
                            <div className="checkbox-field">
                                <input 
                                    type="checkbox" 
                                    id="eatAtSchool" 
                                    checked={eatAtSchool}
                                    onChange={(e) => setEatAtSchool(e.target.checked)}
                                />
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
                        </>
                    ) : (
                        <p className="select-child-message">Vui lòng chọn một trẻ để nhập thông tin ăn uống</p>
                    )}
                </div>

                {/* Thông tin chi tiết */}
                <div className="hm-card">
                    <h3>Những lưu ý thêm về bé</h3>
                    {selectedChild ? (
                        <>
                            <h4>Ăn uống</h4>
                            <select 
                                className="eating-select"
                                value={eatingLevel}
                                onChange={(e) => setEatingLevel(e.target.value)}
                            >
                                <option value="">Chọn mức độ ăn uống</option>
                                <option value="day-du">Đầy đủ</option>
                                <option value="vua-an">Vừa đủ</option>
                                <option value="an-it">Ăn ít</option>
                                <option value="ken-an">Kén ăn</option>
                            </select>

                            <h4 style={{ marginTop: "15px" }}>Hoạt động</h4>
                            <select 
                                className="activity-select"
                                value={activityLevel}
                                onChange={(e) => setActivityLevel(e.target.value)}
                            >
                                <option value="">Chọn mức độ hoạt động</option>
                                <option value="nang-dong">Năng động</option>
                                <option value="co-van-dong">Có vận động</option>
                                <option value="it-van-dong">Ít vận động</option>
                            </select>

                            <h4 style={{ marginTop: "15px" }}>Tinh thần</h4>
                            <select 
                                className="mood-select"
                                value={moodLevel}
                                onChange={(e) => setMoodLevel(e.target.value)}
                            >
                                <option value="">Chọn tình trạng tinh thần</option>
                                <option value="vui-ve">Vui vẻ</option>
                                <option value="binh-thuong">Bình thường</option>
                                <option value="buon">Buồn</option>
                            </select>

                            <h4 style={{ marginTop: "15px" }}>Tình trạng sức khỏe hôm nay</h4>
                            <textarea 
                                className="meal-note"
                                placeholder="Nhập ghi chú về tình trạng sức khỏe"
                                rows="3"
                                value={mealNote}
                                onChange={(e) => setMealNote(e.target.value)}
                            ></textarea>

                            <h4 style={{ marginTop: "15px" }}>Khuyến cáo</h4>
                            <textarea 
                                className="recommendation"
                                placeholder="Nhập khuyến cáo cho bé"
                                rows="3"
                                value={recommendation}
                                onChange={(e) => setRecommendation(e.target.value)}
                            ></textarea>
                        </>
                    ) : (
                        <p className="select-child-message">Vui lòng chọn một trẻ để nhập thông tin</p>
                    )}
                </div>
            </div>

            {/* Nút lưu tổng hợp */}
            {selectedChild && (
                <div className="save-all-container">
                    <button 
                        className="save-all-btn"
                        onClick={handleSaveAllAssessment}
                    >
                         Lưu tất cả đánh giá
                    </button>
                </div>
            )}
        </div>
        </div>
    );
};

export default HealthManager; 
