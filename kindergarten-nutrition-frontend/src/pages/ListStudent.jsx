import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Header from "../components/common/Header.jsx";
import childService from "../services/childService.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/background.css";
import "../styles/ListStudent.css"; // import file css riêng

export default function ListStudent() {
  const { user } = useAuth();
  
  // States
  const [allStudents, setAllStudents] = useState([]); // Dữ liệu gốc từ API
  const [students, setStudents] = useState([]); // Dữ liệu hiển thị (đã filter)
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await childService.getMyClassChildren();
      
      if (response.success) {
        const studentsData = response.data.children || [];
        setAllStudents(studentsData);
        setStudents(studentsData);
      } else {
        setError(response.message || 'Lỗi khi tải danh sách học sinh');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Hàm tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setStudents(allStudents);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = allStudents.filter((s) => {
      // Tìm kiếm theo tên học sinh
      const nameMatch = s.full_name?.toLowerCase().includes(searchTermLower);
      
      // Tìm kiếm theo giới tính 
      const genderVietnamese = s.gender === 'male' ? 'nam' : s.gender === 'female' ? 'nữ' : s.gender?.toLowerCase();
      const genderMatch = s.gender?.toLowerCase().includes(searchTermLower) || 
                         genderVietnamese?.includes(searchTermLower);
      
      // Tìm kiếm theo tên phụ huynh
      const parentMatch = s.parent_name?.toLowerCase().includes(searchTermLower);
      
      // Tìm kiếm theo tuổi (chuyển số thành chuỗi để tìm kiếm)
      const ageMatch = s.age?.toString().includes(searchTerm.trim());
      
      // Tìm kiếm theo lớp
      const classMatch = s.class_name?.toLowerCase().includes(searchTermLower);
      
      return nameMatch || genderMatch || parentMatch || ageMatch || classMatch;
    });
    
    setStudents(filtered);
  };

  // Fetch dữ liệu từ API khi component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Tự động tìm kiếm khi searchTerm thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, allStudents]);

  // Hàm format giới tính
  const formatGender = (gender) => {
    return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : gender;
  };

  return (
    <div className="list-student-page">
      <Header />
      <div className="container">
        {/* Title */}
        <h1 className="title">Danh sách học sinh</h1>

        {/* Search Box */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm"
            value={searchTerm}
            onChange={(e) => {
              console.log('Search input change:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log('Enter pressed');
                handleSearch();
              }
            }}
            onFocus={() => console.log('Search input focused')}
            style={{ 
              padding: '12px 15px', 
              fontSize: '16px', 
              border: '2px solid #ddd', 
              borderRadius: '8px',
              width: '400px',
              outline: 'none'
            }}
          />
        </div>



      {/* Loading/Error States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Đang tải danh sách học sinh...
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
          {error}
          <br />
          <button 
            onClick={fetchStudents}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#f08050",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Search results count */}
      {!loading && !error && (
        <div className="search-results-info">
          {searchTerm.trim() !== "" && (
            <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
              Tìm thấy <strong>{students.length}</strong> học sinh 
              {searchTerm.trim() && ` với từ khóa "${searchTerm}"`}
            </p>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <main className="main">
          <table className="student-table">
            <thead>
              <tr>
                <th>Tên học sinh</th>
                <th>Giới tính</th>
                <th>Tên phụ huynh</th>
                <th>Tuổi</th>
                <th>Lớp</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s, idx) => (
                  <tr key={s.child_id || idx}>
                    <td>{s.full_name}</td>
                    <td>{formatGender(s.gender)}</td>
                    <td>{s.parent_name || 'Chưa có thông tin'}</td>
                    <td>{s.age} tuổi</td>
                    <td>{s.class_name || 'Chưa phân lớp'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#888" }}>
                    Không tìm thấy học sinh nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>
      )}
      </div>
    </div>
  );
}
