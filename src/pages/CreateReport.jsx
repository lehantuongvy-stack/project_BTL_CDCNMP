import React, { useState } from "react";
import {Link} from "react-router-dom";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from "recharts";
import "../styles/CreateReport.css";
import '../components/header.css';
import Header from "../components/Header";

const data = [
  { name: "Mục 1", value: 62.4 },
  { name: "Mục 2", value: 25 },
  { name: "Mục 3", value: 12.6 },
];

const COLORS = ["#00C49F", "#0088FE", "#FFBB28"];

function CreateReport() {
  const [chartType, setChartType] = useState("Pie");
  const [title, setTitle] = useState("");
  const [locationDate, setLocationDate] = useState("");
  const [content, setContent] = useState("");
  const [creator, setCreator] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const renderChart = () => {
    switch (chartType) {
      case "Pie":
        return (
          <PieChart width={300} height={250}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      case "Bar":
        return (
          <BarChart width={300} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );
      case "Line":
        return (
          <LineChart width={300} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#82ca9d" />
          </LineChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="report-container">
      <Header />
      <div className="report-header">
        {isSaved ?(
          <span>{title || "Chưa nhập tên báo cáo"}</span>
        ) : (
          <>
           <input
          type="text"
          className="input-title"
          placeholder="Nhập tên báo cáo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        </>
        )}

        {isSaved ?(
          <span>{locationDate || "Chưa nhập địa điểm và ngày tháng"}</span>
        ) : (
          <>
        <input
          type="text"
          className="input-location"
          placeholder="Địa điểm, ngày ... tháng ... năm ..."
          value={locationDate}
          onChange={(e) => setLocationDate(e.target.value)}
        />
        </>
        )} 
      </div>

      {/* Nội dung */}
      <div className="report-content">
        {isSaved ?(
          <span>{content || "Chưa nhập nội dung"}</span>
        ) : (
          <>
           <textarea
          className="input-content"
          placeholder="Nhập nội dung báo cáo"
          value={content}
          onChange={(e) => setContent(e.target.value)}
            />
          </>
        )}
        
      </div>

      {/* Biểu đồ */}
      <div className="report-chart">
        <h3>Biểu đồ dinh dưỡng:</h3>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="chart-select"
        >
          <option value="Pie">Biểu đồ Tròn</option>
          <option value="Bar">Biểu đồ Cột</option>
          <option value="Line">Biểu đồ Đường</option>
        </select>
        {renderChart()}
      </div>

      {/* Người tạo */}
      <div className="report-footer">
        {isSaved ? (
          <span>Người tạo: {creator || "Chưa nhập tên"}</span>
        ) : (
          <>
            Người tạo:{" "}
            <input
              type="text"
              className="input-creator"
              placeholder="Nhập tên người tạo"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
            />
          </>
        )}
      </div>

      {/* Nút Lưu / Chỉnh sửa */}
      <div className="report-actions">
        {isSaved ? (
          <button className="btn-edit" onClick={() => setIsSaved(false)}>
            Chỉnh sửa lại
          </button>
        ) : (
          <button className="btn-save" onClick={() => setIsSaved(true)}>
            Lưu
          </button>
        )}
        <Link to ="/report" className="back-btn">Quay lại</Link>
      </div>
    </div>
  );
}

export default CreateReport;
