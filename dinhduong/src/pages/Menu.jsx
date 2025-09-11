import React, { useState } from "react";
import "../styles/background.css";
import "./../styles/Menu.css";  // import css riêng cho Menu

function Menu() {
    const [activeTab, setActiveTab] = useState("ngay");

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
                {/* Nhóm Nhà Trẻ */}
                <div className="group-box">
                    <h3>Nhóm Nhà Trẻ</h3>
                    <div className="meal">
                        <div className="meal-title">
                            Bữa sáng <span className="kcal">160kcal</span>
                        </div>
                        <p>Cháo thịt bằm</p>
                        <div className="divider"></div>
                    </div>
                    <div className="meal">
                        <div className="meal-title">
                            Bữa trưa <span className="kcal">300kcal</span>
                        </div>
                        <p>Cháo gà hầm hạt sen</p>
                        <div className="divider"></div>
                    </div>
                    <div className="meal">
                        <div className="meal-title">
                            Bữa xế <span className="kcal">100kcal</span>
                        </div>
                        <p>Sữa tươi</p>
                    </div>
                </div>

                {/* Nhóm Mẫu Giáo */}
                <div className="group-box">
                    <h3>Nhóm Mẫu Giáo</h3>
                    <div className="meal">
                        <div className="meal-title">
                            Bữa sáng <span className="kcal">220kcal</span>
                        </div>
                        <p>Bún thịt bò</p>
                        <div className="divider"></div>
                    </div>
                    <div className="meal">
                        <div className="meal-title">
                            Bữa trưa <span className="kcal">360kcal</span>
                        </div>
                        <p>Cơm + Canh chua cá + trứng rán</p>
                        <div className="divider"></div>
                    </div>
                    <div className="meal">
                        <div className="meal-title">
                            Bữa xế <span className="kcal">200kcal</span>
                        </div>
                        <p>Sữa tươi + bánh bông lan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Menu;
