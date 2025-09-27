import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import BackButton from "../components/BackButton"; // 👈 import nút back riêng


import "../styles/background.css";
import "../styles/ListStudent.css"; // import file css riêng

export default function ListStudent() {
  // Dữ liệu gốc
  const studentData = [
    { name: "Trần Văn A", gender: "Nam", parent: "Nguyễn C" },
    { name: "Trần Văn B", gender: "Nữ", parent: "Nguyễn D" },
    { name: "Lê Văn C", gender: "Nam", parent: "Trần E" },
    { name: "Phạm Thị D", gender: "Nữ", parent: "Hoàng F" },
  ];

  const [students, setStudents] = useState(studentData);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setStudents(studentData); // reset lại danh sách nếu không nhập
    } else {
      const filtered = studentData.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setStudents(filtered);
    }
  };

  return (
    <div className="container home">
      {/* Header */}
      <header className="list-header">
        {/* Back button */}
        <BackButton to="/" />

        {/* Title */}
        <h1 className="title">Danh sách học sinh</h1>

        {/* ✅ Search box */}
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

        {/* Flower icon */}
        <img
          src="/images/icon.png"
          alt="icon"
          className="logout-icon"
        />
      </header>

      {/* Table */}
      <main className="main">
        <table className="student-table">
          <thead>
            <tr>
              <th>Tên học sinh</th>
              <th>Giới tính</th>
              <th>Tên phụ huynh</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((s, idx) => (
                <tr key={idx}
                  className="row-link"
                  onClick={() => window.location.href = ``}> 
                  <td>{s.name}</td>
                  <td>{s.gender}</td>
                  <td>{s.parent}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>
                  Không tìm thấy học sinh nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
