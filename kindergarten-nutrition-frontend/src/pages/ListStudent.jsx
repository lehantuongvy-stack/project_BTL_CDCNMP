import React, { useState, useEffect } from "react";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import Header from "../components/common/Header.jsx";
import childService from "../services/childService.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/background.css";
import "../styles/ListStudent.css"; // import file css riêng

// BackButton component
const BackButton = ({ to }) => (
  <button 
    className="back-btn"
    onClick={() => window.location.href = to}
  >
    <FaArrowLeft /> Quay lại
  </button>
);

export default function ListStudent() {
  const { user } = useAuth();
  
  // States
  const [allStudents, setAllStudents] = useState([]); // Dữ liệu gốc từ API
  const [students, setStudents] = useState([]); // Dữ liệu hiển thị (đã filter)
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format gender
  const formatGender = (gender) => {
    if (gender === 'male' || gender === 'nam' || gender === 'M') return 'Nam';
    if (gender === 'female' || gender === 'nữ' || gender === 'F') return 'Nữ';
    return gender || 'Chưa xác định';
  };

  // Fetch dữ liệu từ API khi component mount
  useEffect(() => {
    fetchStudents();
  }, []);

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
      setStudents(allStudents); // reset lại danh sách nếu không nhập
    } else {
      const filtered = allStudents.filter((s) =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setStudents(filtered);
    }
  };



  return (
    <div className="list-student-page">
      <div className="container home">
        {/* Header */}
        <header className="list-header">
          {/* Back button */}
          <BackButton to="/" />
          {/* Title */}
          <h1 className="title">Danh sách học sinh</h1>

          {/* Search box */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()} // bấm Enter để tìm
            />
            <button className="search-btn" onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>
        </header>

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
                    <tr key={s.child_id || idx} className="row-link">
                      <td>{s.full_name || s.name}</td>
                      <td>{formatGender(s.gender)}</td>
                      <td>{s.parent_name || s.parent || 'Chưa có thông tin'}</td>
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
