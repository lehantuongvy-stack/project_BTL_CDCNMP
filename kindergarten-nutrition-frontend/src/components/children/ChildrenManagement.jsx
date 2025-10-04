import React, { useState, useEffect } from 'react';
import childService from '../../services/childService';
import './ChildrenManagement.css';

const ChildrenManagement = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    className: '',
    gender: '',
    hasAllergy: '',
    hasMedicalCondition: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10
  });

  // Load children on component mount and filter change
  useEffect(() => {
    loadChildren();
  }, [filters, pagination.current_page]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.searchTerm) {
        queryParams.append('q', filters.searchTerm);
      }
      if (filters.className) {
        queryParams.append('class', filters.className);
      }
      if (filters.gender) {
        queryParams.append('gender', filters.gender);
      }
      if (filters.hasAllergy) {
        queryParams.append('has_allergy', filters.hasAllergy);
      }
      if (filters.hasMedicalCondition) {
        queryParams.append('has_medical_condition', filters.hasMedicalCondition);
      }
      
      queryParams.append('page', pagination.current_page.toString());
      queryParams.append('limit', pagination.items_per_page.toString());
      
      let response;
      const hasFilters = Object.values(filters).some(value => value);
      
      if (hasFilters) {
        // Use search API when filters are applied
        response = await childService.searchChildren(queryParams.toString());
      } else {
        // Use regular get all API when no filters
        response = await childService.getAllChildren({
          page: pagination.current_page,
          limit: pagination.items_per_page
        });
      }
      
      if (response.success) {
        console.log(' Children response data:', response.data);
        console.log(' First child data:', response.data.children?.[0]);
        
        // Process children data to handle emergency_contact if it's JSON
        const processedChildren = (response.data.children || []).map(child => {
          let processedChild = { ...child };
          
          // Handle emergency_contact if it's a JSON string
          if (typeof child.emergency_contact === 'string') {
            try {
              processedChild.emergency_contact = JSON.parse(child.emergency_contact);
            } catch (e) {
              // Keep as string if parsing fails
              processedChild.emergency_contact = child.emergency_contact;
            }
          }
          
          return processedChild;
        });
        
        setChildren(processedChildren);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.data.pagination
          }));
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    // Reset to first page when filter changes
    setPagination(prev => ({
      ...prev,
      current_page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      className: '',
      gender: '',
      hasAllergy: '',
      hasMedicalCondition: ''
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      current_page: newPage
    }));
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="children-management" style={{ color: '#333' }}>
      <div className="children-header">
        <h2>Quản lý trẻ em</h2>
        <p>Tìm kiếm và quản lý thông tin trẻ em trong hệ thống</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="searchTerm">Tìm kiếm</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Tìm theo tên, mã học sinh, ID..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="className">Lớp học</label>
            <select
              id="className"
              value={filters.className}
              onChange={(e) => handleFilterChange('className', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả lớp</option>
              <option value="Mầm 1">Mầm 1</option>
              <option value="Mầm 2">Mầm 2</option>
              <option value="Chồi 1">Chồi 1</option>
              <option value="Chồi 2">Chồi 2</option>
              <option value="Lá 1">Lá 1</option>
              <option value="Lá 2">Lá 2</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="gender">Giới tính</label>
            <select
              id="gender"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="M">Nam</option>
              <option value="F">Nữ</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="hasAllergy">Dị ứng</label>
            <select
              id="hasAllergy"
              value={filters.hasAllergy}
              onChange={(e) => handleFilterChange('hasAllergy', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="true">Có dị ứng</option>
              <option value="false">Không dị ứng</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="hasMedicalCondition">Tình trạng y tế</label>
            <select
              id="hasMedicalCondition"
              value={filters.hasMedicalCondition}
              onChange={(e) => handleFilterChange('hasMedicalCondition', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="true">Có vấn đề</option>
              <option value="false">Bình thường</option>
            </select>
          </div>

          <div className="filter-actions">
            <button 
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        <div className="results-header">
          <div className="results-info">
            <span className="results-count">
              Tìm thấy {pagination.total_items} trẻ em
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách trẻ em...</p>
          </div>
        ) : children.length > 0 ? (
          <>
            <div className="children-table">
              <table style={{ color: '#333' }}>
                <thead style={{ color: '#333' }}>
                  <tr style={{ color: '#333' }}>
                    <th style={{ color: '#333' }}>Mã học sinh</th>
                    <th style={{ color: '#333' }}>Họ và tên</th>
                    <th style={{ color: '#333' }}>Ngày sinh</th>
                    <th style={{ color: '#333' }}>Tuổi</th>
                    <th style={{ color: '#333' }}>Giới tính</th>
                    <th style={{ color: '#333' }}>Lớp</th>
                    <th style={{ color: '#333' }}>Phụ huynh</th>
                    <th style={{ color: '#333' }}>Giáo viên</th>
                    <th style={{ color: '#333' }}>Chiều cao</th>
                    <th style={{ color: '#333' }}>Cân nặng</th>
                    <th style={{ color: '#333' }}>Dị ứng</th>
                    <th style={{ color: '#333' }}>Tình trạng y tế</th>
                    <th style={{ color: '#333' }}>Liên hệ khẩn cấp</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#333' }}>
                  {children.map((child) => (
                    <tr key={child.id} style={{ color: '#333' }}>
                      <td className="student-id" style={{ color: '#333' }}>{child.student_id || 'NULL'}</td>
                      <td className="name" style={{ color: '#333' }}>{child.name || child.full_name || 'NULL'}</td>
                      <td className="birth-date" style={{ color: '#333' }}>{formatDate(child.birth_date || child.date_of_birth)}</td>
                      <td className="age" style={{ color: '#333' }}>{child.age || calculateAge(child.birth_date || child.date_of_birth)}</td>
                      <td className="gender" style={{ color: '#333' }}>
                        {child.gender === 'M' ? 'Nam' : child.gender === 'F' ? 'Nữ' : 'NULL'}
                      </td>
                      <td className="class-name" style={{ color: '#333' }}>{child.class_name || 'NULL'}</td>
                      <td className="parent-name" style={{ color: '#333' }}>{child.parent_name || 'NULL'}</td>
                      <td className="teacher-name" style={{ color: '#333' }}>{child.teacher_name || 'NULL'}</td>
                      <td className="height" style={{ color: '#333' }}>{child.height ? `${child.height} cm` : 'NULL'}</td>
                      <td className="weight" style={{ color: '#333' }}>{child.weight ? `${child.weight} kg` : 'NULL'}</td>
                      <td style={{ color: '#333' }}>
                        {child.allergies ? (
                          <span className="allergy-badge has-allergy" title={child.allergies} style={{ color: '#333' }}>
                             {child.allergies}
                          </span>
                        ) : (
                          <span className="allergy-badge no-allergy" style={{ color: '#333' }}>
                            NULL
                          </span>
                        )}
                      </td>
                      <td className="medical-conditions" style={{ color: '#333' }}>
                        {child.medical_conditions ? (
                          <span className="medical-note" title={child.medical_conditions} style={{ color: '#333' }}>
                             {child.medical_conditions}
                          </span>
                        ) : (
                          <span style={{ color: '#333' }}>NULL</span>
                        )}
                      </td>
                      <td className="emergency-contact" style={{ color: '#333' }}>
                        {child.emergency_contact ? (
                          <span className="contact-info" title={
                            typeof child.emergency_contact === 'object' 
                              ? `${child.emergency_contact.name} - ${child.emergency_contact.phone} (${child.emergency_contact.relationship})`
                              : child.emergency_contact
                          } style={{ color: '#333' }}>
                             {
                              typeof child.emergency_contact === 'object'
                                ? `${child.emergency_contact.name} - ${child.emergency_contact.phone}`
                                : child.emergency_contact
                            }
                          </span>
                        ) : (
                          <span style={{ color: '#333' }}>NULL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="pagination-btn"
                >
                  « Trước
                </button>
                
                {Array.from({length: pagination.total_pages}, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-btn ${page === pagination.current_page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="pagination-btn"
                >
                  Sau »
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <div className="no-results-icon"></div>
            <h3>Không tìm thấy trẻ em nào</h3>
            <p>Hãy thử thay đổi điều kiện tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenManagement;