import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Header from "../components/common/Header.jsx"; 
import reportService from '../services/nutritionrpService.js';
import '../styles/background.css';
import "../styles/Report.css";

function Report() {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [search, setSearch] = useState({
    report_name: "",
    month: "",
    created_by: ""
  });

  // Load tất cả báo cáo khi component mount
  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoadingReports(true);
      const res = await reportService.getAllReports();
      setReports(res.data || []);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

// Tìm kiếm báo cáo
const handleSearch = async () => {
  try {
    setLoadingReports(true);
    
    // Load tất cả báo cáo trước
    const res = await reportService.getAllReports();
    let allReports = res.data || [];
    
    console.log(' Search criteria:', search);
    console.log(' Total reports before filter:', allReports.length);
    
    // Filter theo các tiêu chí
    let filteredReports = allReports.filter(report => {
      let matchName = true;
      let matchMonth = true; 
      let matchCreatedBy = true;
      
      // Filter theo tên báo cáo
      if (search.report_name.trim()) {
        matchName = report.report_name && 
          report.report_name.toLowerCase().includes(search.report_name.toLowerCase());
      }
      
      // Filter theo tháng
      if (search.month) {
        const reportDate = new Date(report.report_date);
        const searchDate = new Date(search.month + "-01");
        
        console.log(' Comparing dates:', {
          reportDate: report.report_date,
          parsedReportDate: reportDate,
          searchMonthInput: search.month,
          searchDate: searchDate,
          reportYear: reportDate.getFullYear(),
          reportMonth: reportDate.getMonth(),
          searchYear: searchDate.getFullYear(), 
          searchMonthValue: searchDate.getMonth()
        });
        
        matchMonth = reportDate.getFullYear() === searchDate.getFullYear() &&
                    reportDate.getMonth() === searchDate.getMonth();
        
        console.log(' Month match result:', matchMonth);
      }
      
      // Filter theo người tạo
      if (search.created_by.trim()) {
        matchCreatedBy = report.created_by && 
          report.created_by.toLowerCase().includes(search.created_by.toLowerCase());
      }
      
      const finalMatch = matchName && matchMonth && matchCreatedBy;
      console.log(' Report filter result:', {
        reportName: report.report_name,
        reportDate: report.report_date,
        matchName,
        matchMonth,
        matchCreatedBy,
        finalMatch
      });
      
      return finalMatch;
    });
    
    setReports(filteredReports);
    console.log(' Search results:', filteredReports.length, 'reports found');
  } catch (err) {
    console.error("Error searching reports:", err);
    alert('Có lỗi khi tìm kiếm báo cáo!');
  } finally {
    setLoadingReports(false);
  }
};


  return (
    <div className="home">
      <Header />

      {/* --- Form tìm kiếm báo cáo --- */}
      <div className="search-section">
        <div className="search-row">
          <label>Tên báo cáo</label>
          <input
            type="text"
            placeholder="Nhập tên báo cáo..."
            value={search.report_name}
            onChange={(e) => setSearch(prev => ({ ...prev, report_name: e.target.value }))}
          />
        </div>

        <div className="search-row">
          <label>Tháng</label>
          <input
            type="month"
            value={search.month}
            onChange={(e) => setSearch(prev => ({ ...prev, month: e.target.value }))}
          />
        </div>

        <div className="search-row">
          <label>Người tạo:</label>
          <input
            type="text"
            placeholder="Nhập tên người tạo..."
            value={search.created_by}
            onChange={(e) => setSearch(prev => ({ ...prev, created_by: e.target.value }))}
          />
        </div>

        <div className="search-buttons">
          <Link to="/create" className="btn-primary">Tạo mới</Link>
          <button 
            className="btn-secondary" 
            onClick={handleSearch}
            disabled={loadingReports}
          >
          {loadingReports ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => {setSearch({ report_name: "", month: "", created_by: "" });
            loadAllReports();
            }}
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* --- Kết quả tìm kiếm --- */}
      <div className="results-section">
        <div className="results-header">
          <h3>Kết quả tìm kiếm ({reports.length} báo cáo)</h3>
        </div>
  
        {loadingReports ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="reports-grid">
            {reports.length > 0 ? (
              reports.map(report => (
                <div key={report.id} className="report-card">
                  <h4>{report.report_name || 'Chưa có tên'}</h4>
                  <p><strong>Trường:</strong> {report.school_name}</p>
                  <p><strong>Ngày:</strong> {new Date(report.report_date).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Số trẻ:</strong> {report.num_children}</p>
                  <p><strong>Người tạo:</strong> {report.created_by || 'Không rõ'}</p>
                  <div className="card-actions">
                    <Link to={`/reports/${report.id}`} className="btn-view">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>Không tìm thấy báo cáo nào phù hợp với tiêu chí tìm kiếm.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default Report;
