import React, { useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import "../styles/CreateReport.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function CreateReport() {
  const [saved, setSaved] = useState(false);
  const [chartType, setChartType] = useState("radar");

  // Form state
  const [form, setForm] = useState({
    tenBaoCao: "",
    diaDiem: "",
    ngayThangNam: "",
    nguoiTao: "",
    // Thông tin chung
    truong: "",
    thoiGian: "",
    soTre: "",
    suatAn: "",
    // Dinh dưỡng
    nangLuong: 900,
    nangLuongReq: 1000,
    protein: 34,
    proteinReq: 35,
    lipid: 28,
    lipidReq: 30,
    glucid: 126,
    glucidReq: 140,
    // Tăng trưởng
    growth: [
      { name: "2-3 tuổi", soTre: '50', canNang: '12.5', chieuCao: '88', tyLe: '92' },
      { name: "3-4 tuổi", soTre: '60', canNang: '14.2', chieuCao: '96', tyLe: '90' },
      { name: "5 tuổi", soTre: '55', canNang: '17.5', chieuCao: '107', tyLe: '94' },
    ],
    // Đánh giá thực đơn
    danhGia: [
      "Đa dạng thực phẩm: 8/10 nhóm thực phẩm trong tuần.",
      "Rau củ quả chiếm 15% chi phí → cần tăng lên 20%.",
      "Chế độ ăn nhìn chung cân đối, nhưng nên bổ sung thêm các món từ đậu, hạt."
    ]
  });

  // nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // tiêu đề và địa điểm ngày tháng
  const [title, setTitle] = useState("");
  const [locationDate, setLocationDate] = useState("");
  const [danhGia, setDanhGia] = useState(form.danhGia);

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
const [creator, setCreator] = useState("");

//các nút lưu, chỉnh sửa, in
const handleSave = () => setSaved(true);
const handleEdit = () => setSaved(false);
const handlePrint = () => window.print();

  return (
    <div className="report-page">
      <BackButton />
      <div className="report-card">
        
        {/* Header */}
        <div className="report-header">
          {saved ?(
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

        {saved ?(
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

        {/* 1. Thông tin chung */}
        <section className="section">
          <h2>1. Thông tin chung</h2>
          <ul className="info-list">
            <li>
              <strong>Tên trường:</strong>{" "}
              {saved ? (
                <span>{form.truong}</span>
              ) : (
                <input name="truong" value={form.truong} onChange={handleChange} />
              )}
            </li>
            <li>
              <strong>Thời gian báo cáo:</strong>{" "}
              {saved ? (
                <span>{form.thoiGian}</span>
              ) : (
                <input name="thoiGian" value={form.thoiGian} onChange={handleChange} />
              )}
            </li>
            <li>
              <strong>Số trẻ:</strong>{" "}
              {saved ? (
                <span>{form.soTre}</span>
              ) : (
                <input name="soTre" value={form.soTre} onChange={handleChange} />
              )}
            </li>
            <li>
              <strong>Số suất ăn/ngày:</strong>{" "}
              {saved ? (
                <span>{form.suatAn}</span>
              ) : (
                <input name="suatAn" value={form.suatAn} onChange={handleChange} />
              )}
            </li>
          </ul>
        </section>

        {/* 2. Dinh dưỡng */}
        <section className="section">
          <h2>2. So sánh với chuẩn khuyến nghị</h2>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Nhóm chất</th>
                <th>Trung bình/ngày/bé</th>
                <th>Chuẩn khuyến nghị</th>
                <th>% Đạt</th>
              </tr>
            </thead>
            <tbody>
              {nutrientData.map((d, i) => (
                <tr key={i}>
                  <td>{d.subject}</td>
                  <td>
                    {saved ? (
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
                      />
                    )}
                  </td>
                  <td>
                    {saved ? (
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
                      />
                    )}
                  </td>
                  <td>{((d.A / d.full) * 100).toFixed(0)}%</td>
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
          <h2>3. Theo dõi tăng trưởng trẻ</h2>
          <table className="simple-table">
            <thead>
              <tr>
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
                  <td>{row.name}</td>
                  <td>
                    {saved ? (
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
                      />
                    )}
                  </td>
                  <td>
                    {saved ? (
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
                      />
                    )}
                  </td>
                  <td>
                    {saved ? (
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
                      />
                    )}
                  </td>
                  <td>
                    {saved ? (
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
                        }}
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
          {saved ?(
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
                      className="input-underline"
                      placeholder="Nhập đánh giá..."
                    />
                    <button
                      onClick={() => handleRemoveDanhGia(index)}
                      className="btn-delete"
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={handleAddDanhGia} className="btn-add">
                + Thêm dòng
              </button>
            </>
          )}
        </div>



        {/* Footer */}
        <div className="report-footer">
          <div>
            {saved ? (
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
          <div className="actions">
            <button onClick={handlePrint}>In báo cáo</button>
            {!saved ? (
              <button className="save" onClick={handleSave}>Lưu</button>
            ) : (
              <button className="edit" onClick={handleEdit}>Chỉnh sửa lại</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
