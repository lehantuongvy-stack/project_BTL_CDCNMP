import React, { useState } from "react";
import "../styles/background.css";
import "./../styles/Menu.css";  // import css riêng cho Menu

function Menu() {
    const [activeTab, setActiveTab] = useState("ngay");

    // ✅ Dữ liệu mẫu
    const mealData = {
        "Nhà Trẻ": [
            { title: "Bữa sáng", kcal: 160, dish: "Cháo thịt bằm" },
            { title: "Bữa trưa", kcal: 300, dish: "Cháo gà hầm hạt sen" },
            { title: "Bữa xế", kcal: 100, dish: "Sữa tươi" },
        ],
        "Mẫu Giáo": [
            { title: "Bữa sáng", kcal: 220, dish: "Bún thịt bò" },
            { title: "Bữa trưa", kcal: 360, dish: "Cơm + Canh chua cá + trứng rán" },
            { title: "Bữa xế", kcal: 200, dish: "Sữa tươi + bánh bông lan" },
        ],
    };

    // ✅ Hàm render 1 group
    const renderGroup = (groupName, meals) => (
        <div className="group-box" key={groupName}>
            <h3>Nhóm {groupName}</h3>
            {meals.map((meal, index) => (
                <div className="meal" key={index}>
                    <div className="meal-title">
                        {meal.title} <span className="kcal">{meal.kcal}kcal</span>
                    </div>
                    <p>{meal.dish}</p>
                    {index < meals.length - 1 && <div className="divider"></div>}
                </div>
            ))}
        </div>
    );

    return (
        <div className="menu-container home">
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
                    <button
                        className={activeTab === "thang" ? "active" : ""}
                        onClick={() => setActiveTab("thang")}
                    >
                        Theo tháng
                    </button>
                </div>
            </div>

            <div className="date-field">
                <label htmlFor="date">Ngày:</label>
                <input type="date" id="date" />
            </div>

            <div className="group-container">
                {Object.entries(mealData).map(([groupName, meals]) =>
                    renderGroup(groupName, meals)
                )}
            </div>
        </div>
    );
}

export default Menu;
