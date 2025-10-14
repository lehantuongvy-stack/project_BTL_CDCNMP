import React, { useState, useEffect, useRef } from 'react';
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
  
  // States for autocomplete
  const [parentSearch, setParentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [filteredParents, setFilteredParents] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [highlightedParentIndex, setHighlightedParentIndex] = useState(-1);
  const [highlightedTeacherIndex, setHighlightedTeacherIndex] = useState(-1);
  
  // Refs for click outside detection
  const parentDropdownRef = useRef(null);
  const teacherDropdownRef = useRef(null);
  
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

  // Initialize filtered lists when data loads
  useEffect(() => {
    setFilteredParents(parents);
    setFilteredTeachers(teachers);
  }, [parents, teachers]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (parentDropdownRef.current && !parentDropdownRef.current.contains(event.target)) {
        setShowParentDropdown(false);
      }
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
        setShowTeacherDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search fields when selections change
  useEffect(() => {
    if (childData.parent_id && !parentSearch) {
      setParentSearch(getSelectedParentName());
    }
    if (childData.teacher_id && !teacherSearch) {
      setTeacherSearch(getSelectedTeacherName());
    }
  }, [childData.parent_id, childData.teacher_id, parents, teachers]);

  const loadTeachers = async () => {
    try {                               
      const response = await userService.getUsersByRole('teacher');
      
      if (response.success && response.data) {
        // Check if data is an array directly or has a users property
        const teachersArray = Array.isArray(response.data) ? response.data : response.data.users || response.data.data || [];
        setTeachers(teachersArray);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      // Fallback test data
      setTeachers([
        { id: '60db3d8c-a51c-11f0-8498-a036bc312358', username: 'teacher_gv', full_name: 'giaovien' },
        { id: 'a76399b6-9577-11f0-8f71-a036bc312358', username: 'teacher_li', full_name: 'Li Li' }
      ]);
    }
  };

  const loadParents = async () => {
    try {                               
      const response = await userService.getUsersByRole('parent');
      if (response.success && response.data) {
        // Check if data is an array directly or has a users property
        const parentsArray = Array.isArray(response.data) ? response.data : response.data.users || response.data.data || [];
        setParents(parentsArray);
      } else {
        setParents([]);
      }
    } catch (error) {
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

  // Filter function for search
  const filterParents = (searchTerm) => {
    if (!searchTerm.trim()) return parents;
    return parents.filter(parent => 
      parent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterTeachers = (searchTerm) => {
    if (!searchTerm.trim()) return teachers;
    return teachers.filter(teacher => 
      teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle parent search
  const handleParentSearch = (e) => {
    const value = e.target.value;
    setParentSearch(value);
    const filtered = filterParents(value);
    setFilteredParents(filtered);
    setShowParentDropdown(true);
    setHighlightedParentIndex(-1);
    
    // Clear selection if user is typing
    if (childData.parent_id && value !== getSelectedParentName()) {
      setChildData(prev => ({ ...prev, parent_id: '' }));
    }
  };

  // Handle teacher search
  const handleTeacherSearch = (e) => {
    const value = e.target.value;
    setTeacherSearch(value);
    const filtered = filterTeachers(value);
    setFilteredTeachers(filtered);
    setShowTeacherDropdown(true);
    setHighlightedTeacherIndex(-1);
    
    // Clear selection if user is typing
    if (childData.teacher_id && value !== getSelectedTeacherName()) {
      setChildData(prev => ({ ...prev, teacher_id: '' }));
    }
  };

  // Select parent
  const selectParent = (parent) => {
    setChildData(prev => ({ ...prev, parent_id: parent.id }));
    setParentSearch(`${parent.full_name} (${parent.username})`);
    setShowParentDropdown(false);
    
    // Clear error when user selects
    if (errors.parent_id) {
      setErrors(prev => ({ ...prev, parent_id: '' }));
    }
  };

  // Select teacher
  const selectTeacher = (teacher) => {
    setChildData(prev => ({ ...prev, teacher_id: teacher.id }));
    setTeacherSearch(`${teacher.full_name} (${teacher.username})`);
    setShowTeacherDropdown(false);
    
    // Clear error when user selects
    if (errors.teacher_id) {
      setErrors(prev => ({ ...prev, teacher_id: '' }));
    }
  };

  // Get selected names
  const getSelectedParentName = () => {
    const parent = parents.find(p => p.id === childData.parent_id);
    return parent ? `${parent.full_name} (${parent.username})` : '';
  };

  const getSelectedTeacherName = () => {
    const teacher = teachers.find(t => t.id === childData.teacher_id);
    return teacher ? `${teacher.full_name} (${teacher.username})` : '';
  };

  // Handle keyboard navigation for parent
  const handleParentKeyDown = (e) => {
    if (!showParentDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedParentIndex(prev => 
          prev < filteredParents.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedParentIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedParentIndex >= 0 && filteredParents[highlightedParentIndex]) {
          selectParent(filteredParents[highlightedParentIndex]);
        }
        break;
      case 'Escape':
        setShowParentDropdown(false);
        setHighlightedParentIndex(-1);
        break;
    }
  };

  // Handle keyboard navigation for teacher
  const handleTeacherKeyDown = (e) => {
    if (!showTeacherDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedTeacherIndex(prev => 
          prev < filteredTeachers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedTeacherIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedTeacherIndex >= 0 && filteredTeachers[highlightedTeacherIndex]) {
          selectTeacher(filteredTeachers[highlightedTeacherIndex]);
        }
        break;
      case 'Escape':
        setShowTeacherDropdown(false);
        setHighlightedTeacherIndex(-1);
        break;
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
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

    if (!childData.parent_id) {
      newErrors.parent_id = 'Phụ huynh là bắt buộc';
    }

    if (!childData.teacher_id) {
      newErrors.teacher_id = 'Giáo viên phụ trách là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      setErrors({ general: 'Chỉ admin mới có thể tạo hồ sơ trẻ em' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');
      setErrors({});
      
      // Prepare data for backend
      const childDataForBackend = { ...childData };
      
      // Convert empty strings to null for optional fields
      if (!childDataForBackend.height) childDataForBackend.height = null;
      if (!childDataForBackend.weight) childDataForBackend.weight = null;
      if (!childDataForBackend.parent_id) childDataForBackend.parent_id = null;
      if (!childDataForBackend.teacher_id) childDataForBackend.teacher_id = null;
      
    
      // Create child
      const childResponse = await childService.createChild(childDataForBackend);
  
      if (!childResponse.success) {
        setErrors({ submit: childResponse.message });
      } else {
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
      // Parse error message to show user-friendly message
      let errorMessage = error.message || 'Lỗi không xác định';
      
      // Check for duplicate student_id error
      if (errorMessage.includes('Duplicate entry') && errorMessage.includes('student_id')) {
        const match = errorMessage.match(/Duplicate entry '([^']+)'/);
        const duplicateId = match ? match[1] : childData.student_id;
        errorMessage = `Mã học sinh "${duplicateId}" đã tồn tại trong hệ thống. Vui lòng sử dụng mã khác.`;
      } 
      // Check for other duplicate errors
      else if (errorMessage.includes('Duplicate entry')) {
        errorMessage = `Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.`;
      }
      // Check for constraint errors
      else if (errorMessage.includes('constraint') || errorMessage.includes('foreign key')) {
        errorMessage = `Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.`;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

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

              <div className="form-group autocomplete-container" ref={parentDropdownRef}>
                <label htmlFor="parent_search">Phụ huynh</label>
                <input
                  type="text"
                  id="parent_search"
                  name="parent_search"
                  value={parentSearch}
                  onChange={handleParentSearch}
                  onKeyDown={handleParentKeyDown}
                  onFocus={() => setShowParentDropdown(true)}
                  placeholder="Nhập tên hoặc username phụ huynh..."
                  className={`form-control ${errors.parent_id ? 'is-invalid' : ''}`}
                  autoComplete="off"
                />
                {showParentDropdown && filteredParents.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {filteredParents.slice(0, 10).map((parent, index) => (
                      <div
                        key={parent.id}
                        className={`autocomplete-item ${childData.parent_id === parent.id ? 'selected' : ''} ${highlightedParentIndex === index ? 'highlighted' : ''}`}
                        onClick={() => selectParent(parent)}
                      >
                        <span className="name">{parent.full_name}</span>
                        <span className="username">({parent.username})</span>
                      </div>
                    ))}
                  </div>
                )}
                {showParentDropdown && filteredParents.length === 0 && parentSearch && (
                  <div className="autocomplete-dropdown">
                    <div className="autocomplete-item no-results">
                      Không tìm thấy phụ huynh nào
                    </div>
                  </div>
                )}
                {errors.parent_id && <div className="error-message">{errors.parent_id}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group autocomplete-container" ref={teacherDropdownRef}>
                <label htmlFor="teacher_search">Giáo viên phụ trách</label>
                <input
                  type="text"
                  id="teacher_search"
                  name="teacher_search"
                  value={teacherSearch}
                  onChange={handleTeacherSearch}
                  onKeyDown={handleTeacherKeyDown}
                  onFocus={() => setShowTeacherDropdown(true)}
                  placeholder="Nhập tên hoặc username giáo viên..."
                  className={`form-control ${errors.teacher_id ? 'is-invalid' : ''}`}
                  autoComplete="off"
                />
                {showTeacherDropdown && filteredTeachers.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {filteredTeachers.slice(0, 10).map((teacher, index) => (
                      <div
                        key={teacher.id}
                        className={`autocomplete-item ${childData.teacher_id === teacher.id ? 'selected' : ''} ${highlightedTeacherIndex === index ? 'highlighted' : ''}`}
                        onClick={() => selectTeacher(teacher)}
                      >
                        <span className="name">{teacher.full_name}</span>
                        <span className="username">({teacher.username})</span>
                      </div>
                    ))}
                  </div>
                )}
                {showTeacherDropdown && filteredTeachers.length === 0 && teacherSearch && (
                  <div className="autocomplete-dropdown">
                    <div className="autocomplete-item no-results">
                      Không tìm thấy giáo viên nào
                    </div>
                  </div>
                )}
                {errors.teacher_id && <div className="error-message">{errors.teacher_id}</div>}
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