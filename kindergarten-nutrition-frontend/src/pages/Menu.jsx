import React, { useState } from "react";
import "../styles/background.css";
import "./../styles/Menu.css"; // import css riêng cho Menu
import Header from "../components/common/Header.jsx"; 

function Menu() {
  const [activeTab, setActiveTab] = useState("ngay");

  // Hàm lấy ngày hôm nay ở định dạng yyyy-mm-dd
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  //  Hàm chuyển ngày sang thứ
  const getDayOfWeek = (dateString) => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // State lưu ngày đang chọn
  const [selectedDate, setSelectedDate] = useState(getToday());

  // Dữ liệu mẫu theo từng ngày
  const weeklyMealData = {
    "Thứ Hai": {
      "Nhà Trẻ": [
        { title: "Bữa sáng", kcal: 160, dish: "Cháo thịt bằm" },
        { title: "Bữa trưa", kcal: 300, dish: "Cháo gà hầm hạt sen" },
        { title: "Bữa xế", kcal: 100, dish: "Sữa tươi" },
      ],
      "Mẫu Giáo": [
        { title: "Bữa sáng", kcal: 220, dish: "Bún thịt bò" },
        { title: "Bữa trưa", kcal: 360, dish: "Cơm + Canh chua cá + Trứng rán" },
        { title: "Bữa xế", kcal: 200, dish: "Sữa tươi + Bánh bông lan" },
      ],
    },
    "Thứ Ba": {
      "Nhà Trẻ": [
        { title: "Bữa sáng", kcal: 150, dish: "Cháo cá" },
        { title: "Bữa trưa", kcal: 310, dish: "Cơm + Canh rau ngót + Thịt kho" },
        { title: "Bữa xế", kcal: 120, dish: "Yaourt" },
      ],
      "Mẫu Giáo": [
        { title: "Bữa sáng", kcal: 200, dish: "Phở bò" },
        { title: "Bữa trưa", kcal: 370, dish: "Cơm + Thịt kho trứng + Canh rau muống" },
        { title: "Bữa xế", kcal: 180, dish: "Chuối + Sữa" },
      ],
    },
    "Thứ Tư": {
      "Nhà Trẻ": [
        { title: "Bữa sáng", kcal: 170, dish: "Cháo gà" },
        { title: "Bữa trưa", kcal: 320, dish: "Cơm + Canh mồng tơi + Cá rán" },
        { title: "Bữa xế", kcal: 110, dish: "Bánh flan" },
      ],
      "Mẫu Giáo": [
        { title: "Bữa sáng", kcal: 210, dish: "Bún riêu cua" },
        { title: "Bữa trưa", kcal: 380, dish: "Cơm + Thịt bò xào + Canh rau cải" },
        { title: "Bữa xế", kcal: 190, dish: "Táo + Sữa chua" },
      ],
    },
    "Thứ Năm": {
      "Nhà Trẻ": [
        { title: "Bữa sáng", kcal: 160, dish: "Cháo tôm" },
        { title: "Bữa trưa", kcal: 330, dish: "Cơm + Thịt gà + Canh rau ngót" },
        { title: "Bữa xế", kcal: 115, dish: "Chuối chín" },
      ],
      "Mẫu Giáo": [
        { title: "Bữa sáng", kcal: 230, dish: "Bánh mì + Sữa" },
        { title: "Bữa trưa", kcal: 400, dish: "Cơm + Cá kho + Canh bí đỏ" },
        { title: "Bữa xế", kcal: 200, dish: "Bánh bao + Nước cam" },
      ],
    },
    "Thứ Sáu": {
      "Nhà Trẻ": [
        { title: "Bữa sáng", kcal: 165, dish: "Cháo lươn" },
        { title: "Bữa trưa", kcal: 340, dish: "Cơm + Canh chua + Thịt rim" },
        { title: "Bữa xế", kcal: 105, dish: "Bánh quy + Sữa" },
      ],
      "Mẫu Giáo": [
        { title: "Bữa sáng", kcal: 240, dish: "Hủ tiếu Nam Vang" },
        { title: "Bữa trưa", kcal: 390, dish: "Cơm + Gà chiên + Canh bí xanh" },
        { title: "Bữa xế", kcal: 195, dish: "Xoài + Yaourt" },
      ],
    },
  };

  //  Hàm render nhóm (theo ngày)
  const renderGroup = (groupName, meals) => (
    <div className="group-box" key={groupName}>
      <h3>Nhóm {groupName}</h3>
      {meals.map((meal, index) => (
        <div className="meal" key={index}>
          <div className="meal-title">
            {meal.title} <span className="kcal">{meal.kcal} kcal</span>
          </div>
          <p>{meal.dish}</p>
          {index < meals.length - 1 && <div className="divider"></div>}
        </div>
      ))}
    </div>
  );

  //  Hàm render bảng tuần
  const renderWeekTable = (data) => (
    <table className="menu-table">
      <thead>
        <tr>
          <th rowSpan="2">Thứ</th>
          <th colSpan="3">Nhà Trẻ</th>
          <th colSpan="3">Mẫu Giáo</th>
        </tr>
        <tr>
          <th>Bữa sáng</th>
          <th>Bữa trưa</th>
          <th>Bữa xế</th>
          <th>Bữa sáng</th>
          <th>Bữa trưa</th>
          <th>Bữa xế</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([day, groups], idx) => (
          <tr key={idx}>
            <td>{day}</td>
            <td>{groups["Nhà Trẻ"][0].dish}</td>
            <td>{groups["Nhà Trẻ"][1].dish}</td>
            <td>{groups["Nhà Trẻ"][2].dish}</td>
            <td>{groups["Mẫu Giáo"][0].dish}</td>
            <td>{groups["Mẫu Giáo"][1].dish}</td>
            <td>{groups["Mẫu Giáo"][2].dish}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const todayMeals = weeklyMealData[getDayOfWeek(selectedDate)];

  return (

    <div className="menu-container home">
      <Header />
      <div className="menu-header">
        <div className="menu-title">Thực đơn</div>
        <div className="tabs">
          <button
            className={activeTab === "ngay" ? "active" : ""}
            onClick={() => setActiveTab("ngay")}
          >
            Theo ngày
          </button>
          <button
            className={activeTab === "tuan" ? "active" : ""}
            onClick={() => setActiveTab("tuan")}
          >
            Theo tuần
          </button>
        </div>
      </div>

      {/* Ngày + Thứ */}
      <div className="date-field">
        <label htmlFor="date">Ngày:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <span className="weekday">{getDayOfWeek(selectedDate)}</span>
      </div>

      {/* Nội dung */}
      {activeTab === "ngay" ? (
        <div className="group-container">
          {todayMeals &&
            Object.entries(todayMeals).map(([groupName, meals]) =>
              renderGroup(groupName, meals)
            )}
        </div>
      ) : (
        renderWeekTable(weeklyMealData)
      )}
    </div>
  );
}

export default Menu;
