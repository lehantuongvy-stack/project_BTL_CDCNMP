import React, { useState, useEffect } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";
import "../styles/CreateReport.css";
import { useNavigate, useParams } from "react-router-dom";
import reportService from '../services/nutritionrpService.js';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function CreateReport({ onSave, onCancel, reportData, readOnly = false }) {
  console.log('CreateReport rendering with props:', { onSave, onCancel, reportData, readOnly }); // Debug
  
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if exists
  const [saved, setSaved] = useState(readOnly); // If readOnly, start as saved
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("radar");

  // Load report data from API if ID exists
  useEffect(() => {
    if (id && !reportData) {
      loadReportData(id);
    } else if (reportData) {
      console.log(' Using provided reportData:', reportData);
    }
  }, [id, reportData]);

  const loadReportData = async (reportId) => {
    try {
      setLoading(true);
      
      const response = await reportService.getReportById(reportId);
      
      if (response.success) {
        const data = response.data;
        // Parse nutrition data safely
        let nutritionData = {};
        if (data.nutrition_data) {
          if (typeof data.nutrition_data === 'string') {
            try {
              nutritionData = JSON.parse(data.nutrition_data);
            } catch (e) {
              console.error('Error parsing nutrition_data:', e);
            }
          } else {
            nutritionData = data.nutrition_data;
          }
        }
        
        // Parse growth data safely
        let growthData = [];
        if (data.growth_data) {
          if (typeof data.growth_data === 'string') {
            try {
              growthData = JSON.parse(data.growth_data);
            } catch (e) {
              console.error('Error parsing growth_data:', e);
            }
          } else if (Array.isArray(data.growth_data)) {
            growthData = data.growth_data;
          }
        }
        
        // Update form with loaded data
        setForm({
          tenBaoCao: data.report_name || "",
          truong: data.school_name || "",
          thoiGian: data.report_date ? data.report_date.split('T')[0] : "",
          soTre: data.num_children || "",
          suatAn: data.meals_per_day || "",
          nangLuong: nutritionData.nangLuong || 900,
          nangLuongReq: nutritionData.nangLuongReq || 1000,
          protein: nutritionData.protein || 34,
          proteinReq: nutritionData.proteinReq || 35,
          lipid: nutritionData.lipid || 28,
          lipidReq: nutritionData.lipidReq || 30,
          glucid: nutritionData.glucid || 126,
          glucidReq: nutritionData.glucidReq || 140,
          growth: growthData
        });
        
        console.log('Form updated with data:', {
          tenBaoCao: data.report_name,
          nutritionData,
          growthData
        });
        
        // Update other states
        setCreator(data.created_by || "");
        
        // Parse menu reviews safely
        if (data.menu_reviews) {
          try {
            let reviews = data.menu_reviews;
            if (typeof reviews === 'string') {
              reviews = JSON.parse(reviews);
            }
            setDanhGia(Array.isArray(reviews) ? reviews : []);
          } catch (e) {
            console.error('Error parsing menu_reviews:', e);
            setDanhGia([]);
          }
        }
        
        // Set as saved/read-only mode
        setSaved(true);
        console.log('Report loaded successfully');
      } else {
        console.error('API Error:', response.message);
        alert(`Lỗi: ${response.message || 'Không thể tải báo cáo'}`);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Có lỗi khi tải báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  const [form, setForm] = useState({
    tenBaoCao: (reportData && reportData.report_name) || "",
    truong: (reportData && reportData.school_name) || "",
    thoiGian: (reportData && reportData.report_date) || "",
    soTre: (reportData && reportData.num_children) || "",
    suatAn: (reportData && reportData.meals_per_day) || "",
    nangLuong: 900,
    nangLuongReq: 1000,
    protein: 34,
    proteinReq: 35,
    lipid: 28,
    lipidReq: 30,
    glucid: 126,
    glucidReq: 140,
    growth: [
      { name: "2-3 tuổi", soTre: '50', canNang: '12.5', chieuCao: '88', tyLe: '92' },
      { name: "3-4 tuổi", soTre: '60', canNang: '14.2', chieuCao: '96', tyLe: '90' },
      { name: "5 tuổi", soTre: '55', canNang: '17.5', chieuCao: '107', tyLe: '94' },
    ]
  });


  // nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange:', name, '=', value); // Debug log
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // tiêu đề và địa điểm ngày tháng
  const [title, setTitle] = useState("");
  const [locationDate, setLocationDate] = useState("");
  const [danhGia, setDanhGia] = useState(() => {
    if (reportData && reportData.menu_reviews) {
      try {
        const parsed = typeof reportData.menu_reviews === 'string' 
          ? JSON.parse(reportData.menu_reviews) 
          : reportData.menu_reviews;
        return Array.isArray(parsed) ? parsed : [
          "Đa dạng thực phẩm: 8/10 nhóm thực phẩm trong tuần.",
          "Rau củ quả chiếm 15% chi phí → cần tăng lên 20%.",
          "Chế độ ăn nhìn chung cân đối, nhưng nên bổ sung thêm các món từ đậu, hạt."
        ];
      } catch {
        return [
          "Đa dạng thực phẩm: 8/10 nhóm thực phẩm trong tuần.",
          "Rau củ quả chiếm 15% chi phí → cần tăng lên 20%.",
          "Chế độ ăn nhìn chung cân đối, nhưng nên bổ sung thêm các món từ đậu, hạt."
        ];
      }
    }
    return [
      "Đa dạng thực phẩm: 8/10 nhóm thực phẩm trong tuần.",
      "Rau củ quả chiếm 15% chi phí → cần tăng lên 20%.",
      "Chế độ ăn nhìn chung cân đối, nhưng nên bổ sung thêm các món từ đậu, hạt."
    ];
  });

  // dinh dưỡng tính % đạt
  const nutrientData = [
    {
      subject: "Năng lượng",
      A: Number(form.nangLuong),
      full: Number(form.nangLuongReq),
    },
    {
      subject: "Protein",
      A: Number(form.protein),
      full: Number(form.proteinReq),
    },
    {
      subject: "Lipid",
      A: Number(form.lipid),
      full: Number(form.lipidReq),
    },
    {
      subject: "Glucid",
      A: Number(form.glucid),
      full: Number(form.glucidReq),
    },
  ];
  
  console.log(' Chart nutrientData:', nutrientData);
  console.log(' Form values for charts:', {
    nangLuong: form.nangLuong,
    protein: form.protein,
    lipid: form.lipid,
    glucid: form.glucid
  });

  //đánh giá thực đơn
  const handleChangeDanhGia = (index, value) => {
  const newList = [...danhGia];
  newList[index] = value;
  setDanhGia(newList);
};

//xóa đánh giá
const handleRemoveDanhGia = (index) => {
  setDanhGia(danhGia.filter((_, i) => i !== index));
};

//thêm đánh giá
const handleAddDanhGia = () => {
  setDanhGia([...danhGia, ""]);
};

  const nutrientPie = nutrientData.map((d) => ({
    name: d.subject,
    value: d.A,
  }));
//vẽ biểu đồ cho phần 3
const growthChartData = form.growth.map(row => ({
  ...row,
  canNang:
    row.canNang === "" || isNaN(Number(row.canNang))
      ? undefined
      : Number(row.canNang),
  chieuCao:
    row.chieuCao === "" || isNaN(Number(row.chieuCao))
      ? undefined
      : Number(row.chieuCao),
}));

//người tạo
const [creator, setCreator] = useState((reportData && reportData.created_by) || "");

//các nút lưu, chỉnh sửa, in
const handleSave = () => {
  setSaved(true);
  // Cập nhật title và locationDate nếu chưa có
  if (!title && form.truong) {
    setTitle(form.tenBaoCao);
  }
  if (!locationDate && form.thoiGian) {
    setLocationDate(form.thoiGian);
  }
};
const handleEdit = () => setSaved(false);
const handlePrint = () => window.print();

//gửi dữ liệu lên backend
const handleSubmit = async (e) => {
  e.preventDefault();

  // Don't allow saving if we're in view-only mode (from URL)
  if (id && !saved) {
    alert('Báo cáo này đã tồn tại. Không thể chỉnh sửa.');
    return;
  }

  console.log('Form data before submit:', form); // Debug log
  console.log('tenBaoCao value:', form.tenBaoCao); // Debug log

  const reportData = {
    report_name: form.tenBaoCao || 'Báo cáo dinh dưỡng',
    school_name: form.truong,
    report_date: form.thoiGian,
    num_children: parseInt(form.soTre) || 0,
    meals_per_day: parseInt(form.suatAn) || 0,
    nutrition_data: {
      nangLuong: form.nangLuong,
      nangLuongReq: form.nangLuongReq,
      protein: form.protein,
      proteinReq: form.proteinReq,
      lipid: form.lipid,
      lipidReq: form.lipidReq,
      glucid: form.glucid,
      glucidReq: form.glucidReq
    },
    growth_data: form.growth,
    menu_reviews: danhGia,
    created_by: creator || "Admin"
  };

  try {
    // Validation cơ bản
    if (!form.truong || !form.thoiGian) {
      alert('Vui lòng nhập đầy đủ tên trường và thời gian báo cáo!');
      return;
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem('authToken');
    
    console.log('Debug token:', token ? 'Token found' : 'No token');
    console.log('Token length:', token ? token.length : 0);
    
    if (!token) {
      alert('Bạn cần đăng nhập để tạo báo cáo!');
      return;
    }

    const response = await fetch('http://localhost:3002/api/nutritionrp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });

    const result = await response.json();
    console.log('API Response:', result);
    console.log('Response Status:', response.status);

    if (result.success) {
      alert('Báo cáo đã được lưu thành công!');
      setSaved(true);
      handleSave(); // Chuyển sang chế độ xem
    } else {
      alert(`Lỗi khi lưu báo cáo: ${result.message}`);
    }
  } catch (error) {
    console.error('Error saving report:', error);
    alert('Có lỗi xảy ra khi lưu báo cáo. Vui lòng thử lại!');
  }
};


  return (
    <div className="report-page">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải báo cáo...</p>
          </div>
        </div>
      )}
      
      <div className="header-actions">
        <button
          className="back"
          onClick={() => {
            if (onCancel) {
              onCancel(); 
            } else {
              navigate(-1); // Quay về trang trước
            }
          }}
        >
          ←
        </button>
      </div>
      <div className="report-card">
        {/* Header */}
        <div className="report-header">
          <div className="report-title">
            {saved || readOnly ? (
            <span style={{ color:"black" }}>{form.tenBaoCao || "Chưa nhập tên báo cáo"}</span>
            ) : (
              <>
            <input
              type="text"
              className="input-title"
              name="tenBaoCao"
              placeholder="Nhập tên báo cáo"
              value={form.tenBaoCao}
              onChange={handleChange} disabled={readOnly}
            />
            </>
            )}
          </div>
        </div>

        {/* 1. Thông tin chung */}
        <section className="section">
          <h2 style={{ color:"black" }}>1. Thông tin chung</h2>
          <ul className="info-list">
            <li>
              <strong>Tên trường:</strong>{" "}
              {saved || readOnly ? (
                <span>{form.truong}</span>
              ) : (
                <input name="truong" value={form.truong} onChange={handleChange} disabled={readOnly}/>
              )}
            </li>
            <li>
              <strong>Thời gian báo cáo:</strong>{" "}
              {saved || readOnly ? (
                <span>{form.thoiGian}</span>
              ) : (
                <input name="thoiGian" value={form.thoiGian} onChange={handleChange} disabled={readOnly}/>
              )}
            </li>
            <li>
              <strong>Số trẻ:</strong>{" "}
              {saved || readOnly ? (
                <span>{form.soTre}</span>
              ) : (
                <input name="soTre" value={form.soTre} onChange={handleChange} disabled={readOnly}/>
              )}
            </li>
            <li>
              <strong>Số suất ăn/ngày:</strong>{" "}
              {saved || readOnly ? (
                <span>{form.suatAn}</span>
              ) : (
                <input name="suatAn" value={form.suatAn} onChange={handleChange} disabled={readOnly}/>
              )}
            </li>
          </ul>
        </section>

        {/* 2. Dinh dưỡng */}
        <section className="section">
          <h2 style={{ color:"black" }}>2. So sánh với chuẩn khuyến nghị</h2>
          <table className="simple-table">
            <thead>
              <tr style={{ color:"black" }}>
                <th >Nhóm chất</th>
                <th>Trung bình/ngày/bé</th>
                <th>Chuẩn khuyến nghị</th>
                <th>% Đạt</th>
              </tr>
            </thead>
            <tbody>
              {nutrientData.map((d, i) => (
                <tr key={i}>
                  <td style={{ color:"black" }}>{d.subject}</td>
                  <td style={{ color:"black" }}>
                    {saved || readOnly ? (
                      d.A
                    ) : (
                      <input
                        name={
                          d.subject === "Năng lượng"
                            ? "nangLuong"
                            : d.subject === "Protein"
                            ? "protein"
                            : d.subject === "Lipid"
                            ? "lipid"
                            : "glucid"
                        }
                        value={d.A}
                        onChange={handleChange}
                        disabled={readOnly}
                      />
                    )}
                  </td>
                  <td style={{ color:"black" }}>
                    {saved || readOnly ? (
                      d.full
                    ) : (
                      <input
                        name={
                          d.subject === "Năng lượng"
                            ? "nangLuongReq"
                            : d.subject === "Protein"
                            ? "proteinReq"
                            : d.subject === "Lipid"
                            ? "lipidReq"
                            : "glucidReq"
                        }
                        value={d.full}
                        onChange={handleChange}
                        disabled={readOnly}
                      />
                    )}
                  </td>
                  <td style={{ color:"black" }}>{((d.A / d.full) * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="chart-controls">
            <label>Hiển thị bằng:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              disabled={saved}
            >
              <option value="radar">Radar</option>
              <option value="pie">Pie</option>
            </select>
          </div>

          <div className="chart-area">
            {chartType === "radar" ? (
              <RadarChart cx={200} cy={150} outerRadius={100} width={420} height={300} data={nutrientData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, Math.max(...nutrientData.map(d=>d.full))]} />
                <Radar name="Trung bình" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            ) : (
              <PieChart width={420} height={300}>
                <Pie data={nutrientPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {nutrientPie.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            )}
          </div>
        </section>

        {/* 3. Tăng trưởng */}
        <section className="section">
          <h2 style={{ color:"black" }}>3. Theo dõi tăng trưởng trẻ</h2>
          <table className="simple-table">
            <thead>
              <tr style={{ color:"black" }}>
                <th>Nhóm tuổi</th>
                <th>Số trẻ</th>
                <th>TB Cân nặng (kg)</th>
                <th>TB Chiều cao (cm)</th>
                <th>% Đạt chuẩn WHO</th>
              </tr>
            </thead>
            <tbody>
              {form.growth.map((row, i) => (
                <tr key={i}>
                  <td style={{ color:"black" }}>{row.name}</td>
                  <td>
                    {saved || readOnly ? (
                      row.soTre
                    ) : (
                      <input
                        value={row.soTre}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm(prev => {
                          const copy = [...prev.growth];
                          copy[i].soTre = val;
                          return { ...prev, growth: copy };
                          });
                        }}
                        disabled={readOnly}
                      />
                    )}
                  </td>
                  <td style={{ color:"black" }}>
                    {saved || readOnly ? (
                      row.canNang
                    ) : (
                      <input
                        value={row.canNang}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm(prev => { 
                          const copy = [...prev.growth];
                          copy[i].canNang = val;
                          return { ...prev, growth: copy };
                          });
                        }}
                        disabled={readOnly}
                      />
                    )}
                  </td>
                  <td style={{ color:"black" }}>
                    {saved || readOnly ? (
                      row.chieuCao
                    ) : (
                      <input
                        value={row.chieuCao}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm(prev => {
                          const copy = [...prev.growth];
                          copy[i].chieuCao = val ;
                          return { ...prev, growth: copy };
                          });
                        }}
                        disabled={readOnly}
                      />
                    )}
                  </td>
                  <td style={{ color:"black" }}>
                    {saved || readOnly ? (
                      row.tyLe
                    ) : (
                      <input
                        value={row.tyLe}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm(prev => {
                          const copy = [...prev.growth];
                          copy[i].tyLe = val;
                          return { ...prev, growth: copy };
                          });
                        }}disabled={readOnly}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <LineChart width={600} height={260} data={growthChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="canNang" name="Cân nặng (kg)" stroke="#8884d8" />
            <Line type="monotone" dataKey="chieuCao" name="Chiều cao (cm)" stroke="#82ca9d" />
          </LineChart>
        </section>

        {/* 4. Đánh giá thực đơn */}
        <div className="section">
          <h2>4. Đánh giá thực đơn</h2>
          {saved || readOnly ? (
            <ul>
              {danhGia.map((item, index) => (
                <li key={index}>{item || "..."}</li>
              ))}
            </ul>
          ) : (
            <>
              <ul>
                {danhGia.map((item, index) => (
                  <li key={index}>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleChangeDanhGia(index, e.target.value)}
                      disabled={saved || readOnly}
                      className="input-underline"
                      placeholder="Nhập đánh giá..."
                    />
                    <button
                      onClick={() => handleRemoveDanhGia(index)}
                      className="btn-delete"
                      disabled={saved || readOnly}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={handleAddDanhGia} className="btn-add" disabled={saved || readOnly}>
                + Thêm dòng
              </button>
            </>
          )}
        </div>



        {/* Footer */}
        <div className="report-footer">
          <div>
            {saved || readOnly ? (
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
              disabled={saved || readOnly}
            />
          </>
        )}
      </div>
          <div className="actions">
            <button onClick={handlePrint}>In báo cáo</button>
            {!saved ? (
              <button className="save" onClick={handleSubmit}>Lưu</button>
            ) : (
              <button className="edit" onClick={handleEdit}>Chỉnh sửa lại</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
