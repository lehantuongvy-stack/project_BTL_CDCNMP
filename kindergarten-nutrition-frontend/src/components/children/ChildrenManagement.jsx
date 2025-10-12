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

  // For inline editing
  const [editingCell, setEditingCell] = useState({ childId: null, field: null });
  const [editingValues, setEditingValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});

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
      if (filters.hasAllergy !== '') {
        queryParams.append('has_allergy', filters.hasAllergy);
      }
      if (filters.hasMedicalCondition) {
        queryParams.append('has_medical_condition', filters.hasMedicalCondition);
      }
      
      queryParams.append('page', pagination.current_page.toString());
      queryParams.append('limit', pagination.items_per_page.toString());
      
      let response;
      const hasFilters = filters.searchTerm || filters.className || filters.gender || filters.hasAllergy !== '' || filters.hasMedicalCondition;
      
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

  // Handle inline edit start
  const handleCellClick = (childId, field, currentValue) => {
    setEditingCell({ childId, field });
    setEditingValues({ [`${childId}_${field}`]: currentValue || '' });
    setOriginalValues({ [`${childId}_${field}`]: currentValue || '' });
  };

  // Handle input change during inline edit
  const handleInlineInputChange = (childId, field, value) => {
    setEditingValues(prev => ({
      ...prev,
      [`${childId}_${field}`]: value
    }));
  };

  // Handle save inline edit
  const handleInlineSave = async (childId, field) => {
    const key = `${childId}_${field}`;
    const newValue = editingValues[key];
    const originalValue = originalValues[key];
    
    console.log('🔧 handleInlineSave called - childId:', childId, 'field:', field);
    console.log('🔧 editingValues:', editingValues);
    console.log('🔧 originalValues:', originalValues);
    console.log('🔧 newValue:', newValue, 'type:', typeof newValue);
    console.log('🔧 originalValue:', originalValues[key], 'type:', typeof originalValues[key]);

    // Don't save if value hasn't changed
    if (newValue === originalValues[key]) {
      console.log('🔧 Value unchanged, canceling save');
      handleInlineCancel(childId, field);
      return;
    }
    
    // Validate that we have a valid field (allow empty values for some fields)
    if (!field) {
      console.log('🔧 Invalid field, canceling save');
      handleInlineCancel(childId, field);
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare update data with proper type conversion
      let processedValue = newValue;
      
      // Handle special cases for different field types
      if (field === 'height' || field === 'weight') {
        processedValue = newValue ? parseFloat(newValue) : null;
      } else if (field === 'date_of_birth') {
        // Ensure date is in proper format
        processedValue = newValue || null;
      } else if (field === 'gender') {
        // Ensure gender is 'male' or 'female'
        processedValue = newValue === 'male' || newValue === 'female' ? newValue : 'male';
      } else if (field === 'allergies' || field === 'medical_conditions') {
        // Handle JSON fields
        if (newValue && newValue.trim()) {
          processedValue = newValue.trim();
        } else {
          processedValue = null;
        }
      }
      
      const updateData = {
        [field]: processedValue
      };

      console.log('🔧 Frontend update data:', updateData);
      console.log('🔧 Field:', field, 'New Value:', newValue, 'Processed Value:', processedValue, 'Original Value:', originalValue, 'Child ID:', childId);
      console.log('🔧 typeof updateData:', typeof updateData);
      console.log('🔧 JSON.stringify(updateData):', JSON.stringify(updateData));
      console.log('🔧 Object.keys(updateData):', Object.keys(updateData));

      const response = await childService.updateChild(childId, updateData);
      
      if (response.success) {
        // Update local state
        setChildren(prev => prev.map(child => 
          child.id === childId 
            ? { ...child, [field]: newValue }
            : child
        ));
        
        // Clear editing state
        setEditingCell({ childId: null, field: null });
        setEditingValues({});
        setOriginalValues({});
        
        console.log('Cập nhật thành công!');
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating child:', error);
      alert('Cập nhật thất bại: ' + (error.message || 'Unknown error'));
      
      // Restore original value
      const originalKey = `${childId}_${field}`;
      setEditingValues(prev => ({
        ...prev,
        [key]: originalValues[originalKey]
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel inline edit
  const handleInlineCancel = (childId, field) => {
    const key = `${childId}_${field}`;
    const originalKey = `${childId}_${field}`;
    
    // Restore original value
    setEditingValues(prev => ({
      ...prev,
      [key]: originalValues[originalKey]
    }));
    
    // Clear editing state
    setEditingCell({ childId: null, field: null });
    setEditingValues({});
    setOriginalValues({});
  };

  // Handle Enter key press
  const handleKeyPress = (e, childId, field) => {
    if (e.key === 'Enter') {
      handleInlineSave(childId, field);
    } else if (e.key === 'Escape') {
      handleInlineCancel(childId, field);
    }
  };

  // Handle delete child
  const handleDelete = async (child) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${child.full_name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await childService.deleteChild(child.id);
      
      if (response.success) {
        alert('Xóa thành công!');
        loadChildren(); // Reload list
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Lỗi khi xóa: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Render editable cell
  const renderEditableCell = (child, field, displayValue, inputType = 'text') => {
    const isEditing = editingCell.childId === child.id && editingCell.field === field;
    const key = `${child.id}_${field}`;
    
    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <input
            type={inputType}
            value={editingValues[key] || ''}
            onChange={(e) => handleInlineInputChange(child.id, field, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, child.id, field)}
            onBlur={() => handleInlineSave(child.id, field)}
            className="inline-edit-input"
            autoFocus
          />
          <div className="inline-edit-actions">
            <button 
              onClick={() => handleInlineSave(child.id, field)}
              className="inline-save-btn"
              disabled={loading}
            >
              ✓
            </button>
            <button 
              onClick={() => handleInlineCancel(child.id, field)}
              className="inline-cancel-btn"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="editable-cell"
        onClick={() => handleCellClick(child.id, field, displayValue)}
        title="Click để chỉnh sửa"
      >
        {displayValue || 'Chưa cập nhật'}
      </div>
    );
  };

  // Render select editable cell (for gender, class)
  const renderSelectCell = (child, field, displayValue, options) => {
    const isEditing = editingCell.childId === child.id && editingCell.field === field;
    const key = `${child.id}_${field}`;
    
    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <select
            value={editingValues[key] || displayValue || ''}
            onChange={(e) => handleInlineInputChange(child.id, field, e.target.value)}
            onBlur={() => handleInlineSave(child.id, field)}
            className="inline-edit-select"
            autoFocus
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="inline-edit-actions">
            <button 
              onClick={() => handleInlineSave(child.id, field)}
              className="inline-save-btn"
              disabled={loading}
            >
              ✓
            </button>
            <button 
              onClick={() => handleInlineCancel(child.id, field)}
              className="inline-cancel-btn"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }
    
    // Find the label for display
    const selectedOption = options.find(opt => opt.value === displayValue);
    const displayLabel = selectedOption ? selectedOption.label : displayValue;
    
    return (
      <div 
        className="editable-cell"
        onClick={() => handleCellClick(child.id, field, displayValue)}
        title="Click để chỉnh sửa"
      >
        {displayLabel || 'Chưa cập nhật'}
      </div>
    );
  };

  return (
    <div className="children-management-container">
      <div className="section-header">
        <h2>Quản lý trẻ em</h2>
        <p>Tìm kiếm và quản lý thông tin trẻ em trong hệ thống</p>
      </div>

      {/* Search Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo tên"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Lớp học</label>
          <select
            value={filters.className}
            onChange={(e) => handleFilterChange('className', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả lớp</option>
            <option value="Mầm">Mầm</option>
            <option value="Lá">Lá</option>
            <option value="Chồi">Chồi</option>
            <option value="Hoa">Hoa</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Giới tính</label>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Dị ứng</label>
          <select
            value={filters.hasAllergy}
            onChange={(e) => handleFilterChange('hasAllergy', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            <option value="true">Có dị ứng</option>
            <option value="false">Không dị ứng</option>
          </select>
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Xóa bộ lọc
        </button>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Tìm thấy {pagination.total_items} trẻ em</p>
      </div>

      {/* Children Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-message">
            <p>Đang tải danh sách trẻ em...</p>
          </div>
        ) : children.length === 0 ? (
          <div className="no-results">
            <p>Không tìm thấy trẻ em nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <table className="children-table">
            <thead>
              <tr>
                <th>MÃ HỌC SINH</th>
                <th>HỌ VÀ TÊN</th>
                <th>NGÀY SINH</th>
                <th>TUỔI</th>
                <th>GIỚI TÍNH</th>
                <th>LỚP</th>
                <th>PHỤ HUYNH</th>
                <th>GIÁO VIÊN</th>
                <th>CHIỀU CAO</th>
                <th>CÂN NẶNG</th>
                <th>DỊ ỨNG</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
                <tbody>
                  {children.map((child) => {
                    const genderOptions = [
                      { value: 'male', label: 'Nam' },
                      { value: 'female', label: 'Nữ' }
                    ];
                    
                    const classOptions = [
                      { value: 'Mầm', label: 'Mầm' },
                      { value: 'Lá', label: 'Lá' },
                      { value: 'Chồi', label: 'Chồi' },
                      { value: 'Hoa', label: 'Hoa' }
                    ];

                    return (
                      <tr key={child.id}>
                        <td>{child.student_id || 'Chưa cập nhật'}</td>
                        <td>
                          {renderEditableCell(child, 'full_name', child.name || child.full_name)}
                        </td>
                        <td>
                          {renderEditableCell(child, 'date_of_birth', 
                            (child.birth_date || child.date_of_birth) ? 
                            new Date(child.birth_date || child.date_of_birth).toISOString().split('T')[0] : '',
                            'date'
                          )}
                        </td>
                        <td>{child.age || calculateAge(child.birth_date || child.date_of_birth)}</td>
                        <td>
                          {renderSelectCell(child, 'gender', 
                            child.gender || 'male', 
                            genderOptions
                          )}
                        </td>
                        <td>
                          {renderSelectCell(child, 'class_name', child.class_name, classOptions)}
                        </td>
                        <td>{child.parent_name || 'Chưa cập nhật'}</td>
                        <td>{child.teacher_name || 'Chưa cập nhật'}</td>
                        <td>
                          {renderEditableCell(child, 'height', child.height || '', 'number')}
                        </td>
                        <td>
                          {renderEditableCell(child, 'weight', child.weight || '', 'number')}
                        </td>
                        <td className="allergies">
                          {renderEditableCell(child, 'allergies', 
                            Array.isArray(child.allergies) ? child.allergies.join(', ') : child.allergies || ''
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleDelete(child)}
                              className="delete-btn"
                              disabled={loading}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
        )}
      </div>

    </div>
  );
};

export default ChildrenManagement;