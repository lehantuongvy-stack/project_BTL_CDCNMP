import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/common/Header.jsx';
import '../styles/background.css';
import '../styles/ChildInfo.css';

const API_BASE_URL = 'http://localhost:3002/api';

const Tre = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch children data (from children table only)
  useEffect(() => {
    const fetchChildrenData = async () => {
      if (authLoading) return;

      if (!user || !token) {
        setError('Vui lòng đăng nhập để xem thông tin');
        setLoading(false);
        return;
      }

      if (user.role !== 'parent') {
        setError('Chỉ tài khoản phụ huynh mới có thể xem thông tin trẻ');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/children/basic-info`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success && result.data && result.data.children) {
          console.log('Setting children data:', result.data.children);
          setChildrenData(result.data.children);
          setError(null);
        } else {
          console.log('No children data found');
          setError(result.message || 'Không thể lấy thông tin trẻ');
        }
      } catch (err) {
        setError('Lỗi kết nối với server: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, [user, token, authLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatGender = (gender) => {
    return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : gender;
  };

  // UI states
  if (authLoading) {
    return (
      <div className="background-container">
        <Header />
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="background-container">
        <Header />
        <div className="content-container">
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Đang tải thông tin trẻ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="background-container">
        <Header />
        <div className="content-container">
          <div className="error-message">
            <h2>Có lỗi xảy ra</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!childrenData || childrenData.length === 0) {
    return (
      <div className="background-container">
        <Header />
        <div className="content-container">
          <h1>THÔNG TIN TRẺ</h1>
          <p>Không có thông tin trẻ nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="background-container">
      <Header />
      <div className="content-container">
        <h1>THÔNG TIN TRẺ</h1>
        <div className="child-grid">
          {childrenData.map((child) => (
            <div key={child.child_id || child.id} className="child-card">
              <p><strong>Mã trẻ:</strong> {child.student_id}</p>
              <p><strong>Họ và tên:</strong> {child.full_name}</p>
              <p><strong>Ngày sinh:</strong> {formatDate(child.date_of_birth)}</p>
              <p><strong>Giới tính:</strong> {formatGender(child.gender)}</p>
              <p><strong>Chiều cao:</strong> {child.height ? `${child.height} cm` : 'Chưa cập nhật'}</p>
              <p><strong>Cân nặng:</strong> {child.weight ? `${child.weight} kg` : 'Chưa cập nhật'}</p>
              <p><strong>Lớp:</strong> {child.class_name || 'Chưa xếp lớp'}</p>
              {child.allergies && <p><strong>Dị ứng:</strong> {child.allergies}</p>}
              {child.medical_conditions && <p><strong>Tình trạng y tế:</strong> {child.medical_conditions}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tre;
