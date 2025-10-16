import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import "./../styles/HealthManager.css";
import "../styles/background.css";
// import "../styles/ParentCorner.css";
import Header from '../components/common/Header.jsx';

const API_BASE_URL = 'http://localhost:3002/api';

const HealthStudent = () => {
  const { user, token } = useAuth();
  
  // States cho dữ liệu từ API - lấy theo user ID từ tài khoản đăng nhập
  const [childInfo, setChildInfo] = useState(null);
  const [allChildren, setAllChildren] = useState([]); // Danh sách tất cả con
  const [selectedChildId, setSelectedChildId] = useState(null); // ID của con được chọn
  const [healthStats, setHealthStats] = useState(null); // Dữ liệu từ bảng danh_gia_suc_khoe
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch thông tin cơ bản của trẻ theo user ID
  const fetchChildBasicInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/children/basic-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch child basic info');
      }

      const data = await response.json();
      console.log('Child basic info response:', data);
      
      // Lưu danh sách tất cả con
      const children = data?.data?.children || data?.children || [];
      setAllChildren(children);
      
      // Nếu có con, chọn con đầu tiên làm mặc định
      if (children.length > 0) {
        const firstChild = children[0];
        setSelectedChildId(firstChild.child_id || firstChild.id);
        setChildInfo(firstChild);
      }
      
      setChildInfo(data);
      return data; // Return data để có thể lấy child_id
    } catch (err) {
      console.error('Error fetching child basic info:', err);
      setError(err.message);
      return null;
    }
  };

  // Fetch đánh giá sức khỏe trực tiếp từ bảng danh_gia_suc_khoe
  const fetchHealthStats = async (childId) => {
    try {
      // Thử endpoint hiện có trước
      let response = await fetch(`${API_BASE_URL}/nutrition/stats/${childId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Nếu không có endpoint, thử query trực tiếp (tạm thời dùng records)
        response = await fetch(`${API_BASE_URL}/nutrition/records?child_id=${childId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (!response.ok) {
        throw new Error('Failed to fetch health evaluation data');
      }

      const data = await response.json();
      console.log('Health stats response:', data);
      console.log('Health stats keys:', Object.keys(data));
      if (data.data) {
        console.log('Data keys:', Object.keys(data.data));
      }
      setHealthStats(data);
    } catch (err) {
      console.error('Error fetching health stats:', err);
      setError(err.message);
      
      // Nếu lỗi, thử set dữ liệu mock từ database để test
      console.log('Setting mock data for testing...');
      setHealthStats({
        data: [{
          ngay_danh_gia: '2025-09-09',
          chieu_cao: 105.5,
          can_nang: 18.2,
          bmi: 16.3518,
          tinh_trang_suc_khoe: 'binh_thuong',
          ket_luan: 'Trẻ phát triển tốt, ăn uống đầy đủ',
          khuyen_cao: 'good',
          an_uong: 'normal',
          hoat_dong: 'normal',
          tinh_than: null
        }]
      });
    }
  };

  // Tính BMI (chỉ để hiển thị)
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Xác định tình trạng BMI
  const getBMICategory = (bmi, age, gender) => {
    if (!bmi) return 'Chưa xác định';
    
    // Đây là logic đơn giản, có thể cần điều chỉnh theo chuẩn WHO
    if (bmi < 15) return 'Thiếu cân';
    if (bmi < 18) return 'Bình thường';
    if (bmi < 20) return 'Thừa cân nhẹ';
    return 'Thừa cân';
  };

  // Xử lý khi chọn con khác
  const handleChildSelection = async (childId) => {
    try {
      setLoading(true);
      setSelectedChildId(childId);
      
      // Tìm thông tin con được chọn
      const selectedChild = allChildren.find(child => 
        (child.child_id || child.id) === childId
      );
      
      if (selectedChild) {
        setChildInfo({ data: { children: [selectedChild] } });
        
        // Fetch health stats cho con được chọn
        await fetchHealthStats(childId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) {
        setError('Chưa đăng nhập');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch thông tin cơ bản trước để lấy child_id  
        const childData = await fetchChildBasicInfo();
        
        // Nếu có child_id, fetch health stats
        let childId = null;
        
        if (childData?.data?.children?.[0]?.child_id) {
          childId = childData.data.children[0].child_id;
        } else if (childData?.data?.children?.[0]?.id) {
          childId = childData.data.children[0].id;
        } else if (childData?.children?.[0]?.child_id) {
          childId = childData.children[0].child_id;
        } else if (childData?.children?.[0]?.id) {
          childId = childData.children[0].id;
        } else if (childData?.child_id) {
          childId = childData.child_id;
        }
        
        console.log('Extracted childId:', childId);
        
        if (childId) {
          await fetchHealthStats(childId);
        } else {
          console.warn('Không tìm thấy child_id trong response:', childData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  const renderChildSelector = () => {
    if (allChildren.length <= 1) return null;
    
    const selectedChild = allChildren.find(child => 
      (child.child_id || child.id) === selectedChildId
    );
    
    return (
      <div className="child-selector-dropdown">
        <label htmlFor="child-select">Tên của bé:</label>
        <select 
          id="child-select"
          value={selectedChildId || ''}
          onChange={(e) => handleChildSelection(e.target.value)}
          disabled={loading}
          className="child-dropdown"
        >
          {allChildren.map((child) => {
            const childId = child.child_id || child.id;
            return (
              <option key={childId} value={childId}>
                {child.full_name}
              </option>
            );
          })}
        </select>
      </div>
    );
  };

  // Hàm render Thông tin bé (chỉ hiển thị)
  const renderChildInfo = () => {
    if (!childInfo) return <div className="info-box">Đang tải thông tin...</div>;
    
    // Lấy thông tin của trẻ được chọn
    const selectedChild = allChildren.find(child => 
      (child.child_id || child.id) === selectedChildId
    ) || childInfo.data?.children?.[0] || childInfo.children?.[0] || childInfo;
    
    if (!selectedChild) {
      return (
        <div className="info-box">
          <p><b>Thông tin bé</b></p>
          <p>Không tìm thấy thông tin trẻ</p>
        </div>
      );
    }
    
    return (
      <div className="info-box">
        <p><b>Thông tin bé</b></p>
        <div className="form-row">
          <label>Họ và tên:</label>
          <span className="info-display">{selectedChild.full_name || 'Chưa cập nhật'}</span>
        </div>
        <div className="form-row">
          <label>Ngày sinh:</label>
          <span className="info-display">{selectedChild.date_of_birth ? new Date(selectedChild.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
        </div>
        <div className="form-row">
          <label>Lớp:</label>
          <span className="info-display">{selectedChild.class_name || 'Chưa cập nhật'}</span>
        </div>
        <div className="form-row">
          <label>Tình trạng y tế:</label>
          <span className="info-display">{selectedChild.medical_conditions || 'Không có'}</span>
        </div>
        <div className="form-row">
          <label>Dị ứng:</label>
          <div className="allergies-display">
            {selectedChild.allergies && (
              Array.isArray(selectedChild.allergies) ? selectedChild.allergies.length > 0 : selectedChild.allergies.trim() !== ''
            ) ? (
              <ul className="allergies-list">
                {(Array.isArray(selectedChild.allergies) 
                  ? selectedChild.allergies 
                  : selectedChild.allergies.split(',')
                ).map((allergy, index) => (
                  <li key={index} className="allergy-item">
                    {typeof allergy === 'string' ? allergy.trim() : allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="info-display">Không có dị ứng</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Hàm render BMI và thông tin sức khỏe từ bảng danh_gia_suc_khoe
  const renderHealthInfo = () => {
    if (!healthStats) return <div className="health-info-card">Đang tải thông tin sức khỏe...</div>;
    
    console.log('Full healthStats object:', healthStats);
    
    // Xử lý nhiều dạng response từ API
    let latestRecord = null;
    
    // Trường hợp 1: Có detailed_records (từ nutrition stats API)
    if (healthStats.detailed_records && healthStats.detailed_records.length > 0) {
      latestRecord = healthStats.detailed_records[0];
      console.log('Using detailed_records[0]:', latestRecord);
    }
    // Trường hợp 2: Có data array trong response
    else if (healthStats.data && Array.isArray(healthStats.data) && healthStats.data.length > 0) {
      latestRecord = healthStats.data[0];
      console.log('Using data[0]:', latestRecord);
    }
    // Trường hợp 3: Data trong success response
    else if (healthStats.data && healthStats.data.detailed_records && healthStats.data.detailed_records.length > 0) {
      latestRecord = healthStats.data.detailed_records[0];
      console.log('Using data.detailed_records[0]:', latestRecord);
    }
    // Trường hợp 4: Trả về trực tiếp record
    else if (healthStats.ngay_danh_gia || healthStats.can_nang || healthStats.chieu_cao) {
      latestRecord = healthStats;
      console.log('Using healthStats directly:', latestRecord);
    }
    
    console.log('Latest record for display:', latestRecord);
    
    if (!latestRecord) {
      // Nếu không có latestRecord, thử hiển thị thông tin từ nutrition_summary
      const nutritionSummary = healthStats.nutrition_summary || healthStats.data?.nutrition_summary;
      
      if (nutritionSummary) {
        return (
          <div className="health-info-card">
            <h3>Thông tin sức khỏe của trẻ</h3>
            <div className="form-row">
              <label>Tổng số đánh giá:</label>
              <span className="info-display">{nutritionSummary.total_records || 0}</span>
            </div>
            <div className="form-row">
              <label>Đánh giá gần nhất:</label>
              <span className="info-display">
                {nutritionSummary.latest_assessment ? 
                  new Date(nutritionSummary.latest_assessment).toLocaleDateString('vi-VN') : 
                  'Chưa có đánh giá'
                }
              </span>
            </div>
            {nutritionSummary.growth_trend && (
              <>
                <div className="form-row">
                  <label>Cân nặng hiện tại:</label>
                  <span className="info-display">{nutritionSummary.growth_trend.weight?.current} kg</span>
                </div>
                <div className="form-row">
                  <label>Chiều cao hiện tại:</label>
                  <span className="info-display">{nutritionSummary.growth_trend.height?.current} cm</span>
                </div>
              </>
            )}
          </div>
        );
      }
      
      return (
        <div className="health-info-card">
          <h3>Thông tin sức khỏe của trẻ</h3>
          <p>Chưa có dữ liệu đánh giá sức khỏe</p>
        </div>
      );
    }
    
    // Tính BMI từ dữ liệu trong bảng danh_gia_suc_khoe
    const calculatedBMI = latestRecord.bmi || calculateBMI(latestRecord.can_nang, latestRecord.chieu_cao);
    const childInfo = healthStats.child_info || healthStats.data?.child_info;
    const bmiCategory = getBMICategory(calculatedBMI, childInfo?.age_months, childInfo?.gender);
    
    return (
      <div className="health-info-card">
        <h3>Thông tin sức khỏe của trẻ</h3>
        <div className="form-row">
          <label>Cân nặng (kg):</label>
          <span className="info-display">{latestRecord.can_nang || 'Chưa cập nhật'}</span>
        </div>
        <div className="form-row">
          <label>Chiều cao (cm):</label>
          <span className="info-display">{latestRecord.chieu_cao || 'Chưa cập nhật'}</span>
        </div>
        <div className="form-row">
          <label>BMI:</label>
          <span className="info-display">
            {calculatedBMI ? `${calculatedBMI} (${bmiCategory})` : 'Chưa thể tính'}
          </span>
        </div>
        <div className="form-row">
          <label>Tình trạng sức khỏe:</label>
          <span className="info-display">
            {latestRecord.tinh_trang_suc_khoe === 'binh_thuong' ? 'Bình thường' : 
             (latestRecord.tinh_trang_suc_khoe || 'Chưa đánh giá')}
          </span>
        </div>
        <div className="form-row">
          <label>Khuyến cáo:</label>
          <span className="info-display">
            {latestRecord.khuyen_cao === 'good' ? 'Tốt' : 
             (latestRecord.khuyen_cao || 'Chưa có khuyến cáo')}
          </span>
        </div>
        <div className="form-row">
          <label>Ăn uống:</label>
          <span className="info-display">
            {latestRecord.an_uong === 'normal' ? 'Bình thường' : 
             (latestRecord.an_uong || 'Chưa đánh giá')}
          </span>
        </div>
        <div className="form-row">
          <label>Hoạt động:</label>
          <span className="info-display">
            {latestRecord.hoat_dong === 'normal' ? 'Bình thường' : 
             (latestRecord.hoat_dong || 'Chưa đánh giá')}
          </span>
        </div>
        <div className="form-row">
          <label>Tinh thần:</label>
          <span className="info-display">{latestRecord.tinh_than || 'Chưa đánh giá'}</span>
        </div>
        <div className="form-row">
          <label>Ngày đánh giá:</label>
          <span className="info-display">
            {latestRecord.ngay_danh_gia ? 
              new Date(latestRecord.ngay_danh_gia).toLocaleDateString('vi-VN') : 
              'Chưa có ngày đánh giá'
            }
          </span>
        </div>
      </div>
    );
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="parent-corner-page">
        <Header />
        <div className="parent-corner-container">
          <div className="parent-corner-content">
            <h1>Quản Lý Sức Khỏe</h1>
            <div className="loading-message">Đang tải thông tin...</div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="parent-corner-page">
        <Header />
        <div className="parent-corner-container">
          <div className="parent-corner-content">
            <h1>Quản Lý Sức Khỏe</h1>
            <div className="error-message">
              <p>Có lỗi xảy ra: {error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-corner-page">
      <Header />
      <div className="parent-corner-container">
        <div className="parent-corner-content">
          <div className="header-with-selector">
            <h1>Quản Lý Sức Khỏe</h1>
            {/* Hiển thị dropdown chọn con nếu có nhiều con */}
            {renderChildSelector()}
          </div>
          
          <div className="form-sections">
            {renderChildInfo()}
            {renderHealthInfo()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStudent;
