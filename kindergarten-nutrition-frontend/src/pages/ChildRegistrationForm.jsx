import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import childService from '../services/childService';
import userService from '../services/userService';
import '../styles/ChildRegistration.css';

const ChildRegistrationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Child form data
  const [childData, setChildData] = useState({
    student_id: '',
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    class_name: '',
    parent_id: '',
    teacher_id: '',
    height: '',
    weight: '',
    allergies: '',
    medical_conditions: '',
    nhom: 'mau_giao'
  });

  useEffect(() => {                    
    // Check admin access
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Load teachers, parents and classes
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([loadTeachers(), loadParents(), loadClasses()]);
      setLoadingData(false);
    };
    
    loadData();
  }, [user, navigate]);

  const loadTeachers = async () => {
    try {                               
      console.log('🔧 Loading teachers...');
      const response = await userService.getUsersByRole('teacher');
      console.log('🔧 Teachers response:', response);
      console.log('🔧 Teachers response.data:', response.data);
      console.log('🔧 Teachers response.data type:', typeof response.data);
      console.log('🔧 Teachers response.data is array:', Array.isArray(response.data));
      
      if (response.success && response.data) {
        // Check if data is an array directly or has a users property
        const teachersArray = Array.isArray(response.data) ? response.data : response.data.users || response.data.data || [];
        console.log('🔧 Teachers array:', teachersArray);
        setTeachers(teachersArray);
      } else {
        console.warn('🔧 Teachers response not valid:', response);
        setTeachers([]);
      }
    } catch (error) {
      console.error('🔧 Load teachers error:', error);
      // Fallback test data
      setTeachers([
        { id: '60db3d8c-a51c-11f0-8498-a036bc312358', username: 'teacher_gv', full_name: 'giaovien' },
        { id: 'a76399b6-9577-11f0-8f71-a036bc312358', username: 'teacher_li', full_name: 'Li Li' }
      ]);
    }
  };

  const loadParents = async () => {
    try {                               
      console.log('🔧 Loading parents...');
      const response = await userService.getUsersByRole('parent');
      console.log('🔧 Parents response:', response);
      console.log('🔧 Parents response.data:', response.data);
      console.log('🔧 Parents response.data type:', typeof response.data);
      console.log('🔧 Parents response.data is array:', Array.isArray(response.data));
      
      if (response.success && response.data) {
        // Check if data is an array directly or has a users property
        const parentsArray = Array.isArray(response.data) ? response.data : response.data.users || response.data.data || [];
        console.log('🔧 Parents array:', parentsArray);
        setParents(parentsArray);
      } else {
        console.warn('🔧 Parents response not valid:', response);
        setParents([]);
      }
    } catch (error) {
      console.error('🔧 Load parents error:', error);
      // Fallback test data  
      setParents([
        { id: '40f72795-a466-11f0-b215-a036bc312358', username: 'parent_tuan', full_name: 'Triệu Anh Tuấn' },
        { id: '68a56cb8-a506-11f0-8498-a036bc312358', username: 'parent_tu', full_name: 'Đinh Văn Tú' }
      ]);
    }
  };

  const loadClasses = () => {
    // Classes với ID thực tế từ phpMyAdmin  
    setClasses([
      { id: '1a9a342f-98a3-11f0-9a5b-a036bc312358', name: 'Lá' },
      { id: '1a9a3487-98a3-11f0-9a5b-a036bc312358', name: 'Hoa' },
      { id: '771fc0e3-a4ec-11f0-8498-a036bc312358', name: 'Mầm' },
      { id: '771fdaee-a4ec-11f0-8498-a036bc312358', name: 'Chồi' }
    ]);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔧 Child field changed: ${name} = ${value}`);
    setChildData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!childData.student_id.trim()) {
      newErrors.student_id = 'Mã trẻ là bắt buộc';
    }

    if (!childData.full_name.trim()) {
      newErrors.full_name = 'Tên trẻ là bắt buộc';
    }

    if (!childData.date_of_birth) {
      newErrors.date_of_birth = 'Ngày sinh là bắt buộc';
    }

    if (!childData.class_name.trim()) {
      newErrors.class_name = 'Lớp học là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔧 Child form submission started');
    console.log('🔧 Current user role:', user?.role);
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      setErrors({ general: 'Chỉ admin mới có thể tạo hồ sơ trẻ em' });
      return;
    }
    
    if (!validateForm()) {
      console.error('🔧 Child form validation failed');
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');
      setErrors({});
      
      // Prepare data for backend
      const childDataForBackend = { ...childData };
      console.log('🔧 Original childData:', childData);
      
      // Convert empty strings to null for optional fields
      if (!childDataForBackend.height) childDataForBackend.height = null;
      if (!childDataForBackend.weight) childDataForBackend.weight = null;
      if (!childDataForBackend.parent_id) childDataForBackend.parent_id = null;
      if (!childDataForBackend.teacher_id) childDataForBackend.teacher_id = null;
      
      console.log('🔧 Final child data for backend:', childDataForBackend);
      
      // Create child
      const childResponse = await childService.createChild(childDataForBackend);
      
      console.log('🔧 Child creation response:', childResponse);
      
      if (!childResponse.success) {
        console.warn('🔧 Child creation failed:', childResponse.message);
        setErrors({ submit: childResponse.message });
      } else {
        console.log('🔧 Child creation successful:', childResponse);
        setSuccessMessage('Tạo hồ sơ trẻ em thành công!');
        
        // Reset form
        setChildData({
          student_id: '',
          full_name: '',
          date_of_birth: '',
          gender: 'male',
          class_name: '',
          parent_id: '',
          teacher_id: '',
          height: '',
          weight: '',
          allergies: '',
          medical_conditions: '',
          nhom: 'mau_giao'
        });
      }
    } catch (error) {
      console.error('🔧 Child creation error:', error);
      setErrors({ submit: `Có lỗi khi tạo hồ sơ trẻ: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  console.log('🔧 ChildRegistrationForm render - loadingData:', loadingData);
  console.log('🔧 ChildRegistrationForm render - teachers length:', teachers.length);
  console.log('🔧 ChildRegistrationForm render - parents length:', parents.length);
  console.log('🔧 ChildRegistrationForm render - classes length:', classes.length);

  if (loadingData) {
    return (
      <div className="child-registration-container">
        <div className="child-registration-form">
          <div className="form-header">
            <h2>Tạo hồ sơ trẻ em</h2>
            <p>Đang tải dữ liệu...</p>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div>Đang tải danh sách phụ huynh, giáo viên và lớp học...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="child-registration-container">
      <div className="child-registration-form">
        <div className="form-header">
          <h2>Tạo hồ sơ trẻ em</h2>
          <p>Tạo hồ sơ trẻ em mới trong hệ thống quản lý dinh dưỡng mầm non</p>
        </div>

        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-danger">
            {errors.submit}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
             {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="child-form">
          <div className="form-section">
            <h3>Thông tin trẻ em</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="student_id">Mã trẻ *</label>
                <input
                  type="text"
                  id="student_id"
                  name="student_id"
                  value={childData.student_id}
                  onChange={handleChange}
                  className={`form-control ${errors.student_id ? 'is-invalid' : ''}`}
                  placeholder="Nhập mã trẻ"
                />
                {errors.student_id && <div className="error-message">{errors.student_id}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Tên trẻ *</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={childData.full_name}
                  onChange={handleChange}
                  className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                  placeholder="Nhập tên đầy đủ của trẻ"
                />
                {errors.full_name && <div className="error-message">{errors.full_name}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date_of_birth">Ngày sinh *</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={childData.date_of_birth}
                  onChange={handleChange}
                  className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                />
                {errors.date_of_birth && <div className="error-message">{errors.date_of_birth}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính</label>
                <select
                  id="gender"
                  name="gender"
                  value={childData.gender}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class_name">Lớp học *</label>
                <select
                  id="class_name"
                  name="class_name"
                  value={childData.class_name}
                  onChange={handleChange}
                  className={`form-control ${errors.class_name ? 'is-invalid' : ''}`}
                >
                  <option value="">-- Chọn lớp --</option>
                  {Array.isArray(classes) && classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.name}>
                      Lớp {classItem.name}
                    </option>
                  ))}
                </select>
                {errors.class_name && <div className="error-message">{errors.class_name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="parent_id">Phụ huynh</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={childData.parent_id}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- Chọn phụ huynh --</option>
                  {Array.isArray(parents) && parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name} ({parent.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher_id">Giáo viên phụ trách</label>
                <select
                  id="teacher_id"
                  name="teacher_id"
                  value={childData.teacher_id}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- Chọn giáo viên --</option>
                  {Array.isArray(teachers) && teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                {/* Empty group for layout balance */}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="height">Chiều cao (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={childData.height}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Chiều cao (cm)"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Cân nặng (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={childData.weight}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Cân nặng (kg)"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nhom">Nhóm tuổi</label>
              <select
                id="nhom"
                name="nhom"
                value={childData.nhom}
                onChange={handleChange}
                className="form-control"
              >
                <option value="nha_tre">Nhà trẻ</option>
                <option value="mau_giao">Mẫu giáo</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="medical_conditions">Ghi chú sức khỏe</label>
              <textarea
                id="medical_conditions"
                name="medical_conditions"
                value={childData.medical_conditions}
                onChange={handleChange}
                className="form-control"
                placeholder="Ghi chú về tình trạng sức khỏe của trẻ (không bắt buộc)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Dị ứng</label>
              <textarea
                id="allergies"
                name="allergies"
                value={childData.allergies}
                onChange={handleChange}
                className="form-control"
                placeholder="Ghi chú về các loại dị ứng của trẻ (không bắt buộc)"
                rows="2"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin')}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo hồ sơ trẻ em'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildRegistrationForm;