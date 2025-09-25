import React, { useState } from "react";
import "../styles/background.css";
import "./../styles/Menu.css";
import "./../styles/KitchenMenu.css";
import BackButton from "../components/BackButton";

function KitchenMenu() {
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

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

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isEditing, setIsEditing] = useState(false);

  // Danh sách món có kcal
  const breakfast = [
    { dish: "Cháo thịt bằm", kcal: 160 },
    { dish: "Phở bò", kcal: 200 },
    { dish: "Bún thịt bò", kcal: 220 },
    { dish: "Cháo cá", kcal: 150 },
    { dish: "Hủ tiếu Nam Vang", kcal: 240 },
  ];

  const lunch = [
    { dish: "Cơm + Canh chua cá", kcal: 300 },
    { dish: "Cơm + Thịt kho trứng", kcal: 370 },
    { dish: "Cơm + Gà chiên", kcal: 390 },
    { dish: "Cơm + Cá kho", kcal: 330 },
    { dish: "Cơm + Canh rau muống", kcal: 310 },
  ];

  const brunch = [
    { dish: "Sữa tươi", kcal: 100 },
    { dish: "Chuối", kcal: 120 },
    { dish: "Yaourt", kcal: 150 },
    { dish: "Bánh flan", kcal: 110 },
    { dish: "Bánh bao + Nước cam", kcal: 200 },
  ];

  // Data mẫu
  const initialData = {
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
    // 👉 bạn thêm các ngày khác tương tự
  };

  const [weeklyMealData, setWeeklyMealData] = useState(initialData);
  const [tempMealData, setTempMealData] = useState(null);

  // Khi đổi món
  const handleChange = (day, group, index, newDish) => {
    setTempMealData((prev) => {
      const updated = { ...prev };
      const mealTitle = updated[day][group][index].title;

      const menuList =
        mealTitle === "Bữa sáng" ? breakfast : mealTitle === "Bữa trưa" ? lunch : brunch;

      const selected = menuList.find((item) => item.dish === newDish);

      updated[day][group][index] = {
        ...updated[day][group][index],
        dish: selected.dish,
        kcal: selected.kcal,
      };

      return updated;
    });
  };

  // Render bảng tuần
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
            {["Nhà Trẻ", "Mẫu Giáo"].map((group) =>
              groups[group].map((meal, i) => (
                <td key={group + i}>
                  {isEditing ? (
                    <select
                      value={meal.dish}
                      onChange={(e) => handleChange(day, group, i, e.target.value)}
                    >
                      {(meal.title === "Bữa sáng"
                        ? breakfast
                        : meal.title === "Bữa trưa"
                        ? lunch
                        : brunch
                      ).map((option) => (
                        <option key={option.dish} value={option.dish}>
                          {option.dish}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      {meal.dish}
                      <div className="kcal">({meal.kcal} kcal)</div>
                    </>
                  )}
                </td>
              ))
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="menu-container home">
      <BackButton />

      <div className="menu-header">
        <div className="menu-title">Thực đơn</div>
        <div className="tabs">
          <button className="active">Theo Tuần</button>
        </div>
        <div className="menu-actions">
          {/* Lưu */}
          <button
            className="btn-save"
            onClick={() => {
              if (tempMealData) setWeeklyMealData(tempMealData);
              setTempMealData(null);
              setIsEditing(false);
            }}
          >
            Lưu
          </button>

          {/* Sửa / Hủy */}
          <button
            className="btn-edit"
            onClick={() => {
              if (isEditing) {
                // Hủy
                setTempMealData(null);
                setIsEditing(false);
              } else {
                // Bắt đầu sửa → copy data
                setTempMealData(JSON.parse(JSON.stringify(weeklyMealData)));
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? "Hủy" : "Sửa"}
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

      {/* Bảng tuần */}
      {renderWeekTable(isEditing ? tempMealData : weeklyMealData)}
    </div>
  );
}

export default KitchenMenu;
