import React, { useState, useEffect } from "react";
import "../styles/background.css";
import "./../styles/Menu.css"; 
import BackButton from "../components/BackButton";
import mealService from "../services/mealService.js";
import { useAuth } from "../context/AuthContext";

function Menu() {
  const { user } = useAuth(); // Get current user for role checking
  const [activeTab, setActiveTab] = useState("ngay");
  const [weeklyMealData, setWeeklyMealData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Parent security filtering states
  const [childrenInfo, setChildrenInfo] = useState([]);
  const [parentSecurityFilters, setParentSecurityFilters] = useState({
    nhom: null,
    classId: null
  });

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

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Load parent children info and apply security filters
  const loadInitialData = async () => {
    try {
      if (user && user.role === 'parent') {
        console.log('[Menu] Loading parent security data for user:', user.username);
        
        // Load children basic info for parent security filtering
        const childrenResponse = await mealService.getChildrenBasicInfo();
        if (childrenResponse.success && childrenResponse.data && childrenResponse.data.children) {
          const childrenData = childrenResponse.data.children;
          setChildrenInfo(childrenData);
          
          // Extract security filters from children data
          const nhomSet = new Set(childrenData.map(child => child.nhom));
          const classIdSet = new Set(childrenData.map(child => child.class_id));
          
          // In future, could support multiple groups
          const filters = {
            nhom: nhomSet.size > 0 ? Array.from(nhomSet)[0] : null,
            classId: classIdSet.size > 0 ? Array.from(classIdSet)[0] : null
          };
          
          setParentSecurityFilters(filters);
          console.log('[Menu] Parent security filters applied:', filters);
          
          // Load meal data with the extracted security filters (not from state)
          await loadWeeklyMealsWithFilters(filters);
          return; // Exit early since we already loaded meals
        }
      }
      
      // Load meal data without security filters (for teacher/admin)
      await loadWeeklyMeals();
    } catch (error) {
      console.error('[Menu] Error loading initial data:', error);
      setError(error.message || 'Lỗi tải dữ liệu ban đầu');
    }
  };

  const loadWeeklyMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy ngày đầu tuần từ selectedDate
      const weekStart = mealService.getWeekStart(selectedDate);
      
      // Teacher/admin sees all data
      const response = await mealService.getWeeklyMeals(weekStart);
      
      if (response.success) {
        setWeeklyMealData(response.data || {});
        console.log('[Menu] Loaded meal data (no filters):', response.data);
      } else {
        setError(response.message || 'Không thể tải thực đơn');
      }
    } catch (error) {
      console.error('Error loading weekly meals:', error);
      setError(error.message || 'Lỗi kết nối API');
    } finally {
      setLoading(false);
    }
  };

const loadWeeklyMealsWithFilters = async (filters) => {
  try {
    setLoading(true);
    setError(null);

    // Lấy start_date từ filter hoặc mặc định = hôm nay
    const startDate = filters.startDate || new Date().toISOString().split("T")[0];

    // Tính end_date = start_date + 6 ngày
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endDate = end.toISOString().split("T")[0];

    console.log("[Menu] Loading weekly meals:", { startDate, endDate, filters });

    // Gọi API với đủ tham số
    const response = await mealService.getWeeklyMeals(startDate, endDate, filters.nhom);

    if (response.success) {
      console.log("[Menu] Weekly meals loaded:", response.data);

      // Nếu cần lọc thêm theo nhóm lớp ở frontend
      let filteredData = response.data;
      if (filters.nhom) {
        filteredData = {};
        if (response.data["Nhà Trẻ"] && filters.nhom === "nha_tre") {
          filteredData["Nhà Trẻ"] = response.data["Nhà Trẻ"];
        }
        if (response.data["Mẫu Giáo"] && filters.nhom === "mau_giao") {
          filteredData["Mẫu Giáo"] = response.data["Mẫu Giáo"];
        }
      }

      setWeeklyMealData(filteredData);
    } else {
      setError(response.message || "Không thể tải thực đơn tuần");
    }
  } catch (err) {
    console.error("[Menu] Error loading weekly meals with filters:", err);
    setError(err.message || "Lỗi khi gọi API thực đơn tuần");
  } finally {
    setLoading(false);
  }
};

  //  Hàm render nhóm (theo ngày)
  const renderGroup = (groupName, meals) => (
    <div className="group-box" key={groupName}>
      <h3>Nhóm {groupName}</h3>
      {meals && meals.length > 0 ? (
        meals.map((meal, index) => (
          <div className="meal" key={index}>
            <div className="meal-title">
              {meal.meal_type_name} <span className="kcal">{meal.kcal} kcal</span>
            </div>
            <p>{meal.food_name}</p>
            {index < meals.length - 1 && <div className="divider"></div>}
          </div>
        ))
      ) : (
        <p>Chưa có thực đơn</p>
      )}
    </div>
  );

  //  Hàm render bảng tuần
  const renderWeekTable = (data) => {
    const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];
    
    return (
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
          {daysOfWeek.map((day, idx) => {
            const nhaTreMeals = data["Nhà Trẻ"] && data["Nhà Trẻ"][day] ? data["Nhà Trẻ"][day] : [];
            const mauGiaoMeals = data["Mẫu Giáo"] && data["Mẫu Giáo"][day] ? data["Mẫu Giáo"][day] : [];
            
            // Tìm meals theo loại
            const findMealByType = (meals, type) => {
              const meal = meals.find(m => m.meal_type === type);
              return meal ? meal.food_name : "Chưa có";
            };
            
            return (
              <tr key={idx}>
                <td>{day}</td>
                <td>{findMealByType(nhaTreMeals, 'sang')}</td>
                <td>{findMealByType(nhaTreMeals, 'trua')}</td>
                <td>{findMealByType(nhaTreMeals, 'xe')}</td>
                <td>{findMealByType(mauGiaoMeals, 'sang')}</td>
                <td>{findMealByType(mauGiaoMeals, 'trua')}</td>
                <td>{findMealByType(mauGiaoMeals, 'xe')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Lấy dữ liệu cho ngày được chọn
  const selectedDayName = getDayOfWeek(selectedDate);
  
// Xây todayMeals theo selectedDayName
let todayMeals = {};

// Nếu là parent -> chỉ filter nhóm con
if (user.role === "parent" && parentSecurityFilters.nhom) {
  if (
    parentSecurityFilters.nhom === "nha_tre" &&
    weeklyMealData["Nhà Trẻ"] &&
    weeklyMealData["Nhà Trẻ"][selectedDayName]
  ) {
    todayMeals["Nhà Trẻ"] = weeklyMealData["Nhà Trẻ"][selectedDayName];
  }
  if (
    parentSecurityFilters.nhom === "mau_giao" &&
    weeklyMealData["Mẫu Giáo"] &&
    weeklyMealData["Mẫu Giáo"][selectedDayName]
  ) {
    todayMeals["Mẫu Giáo"] = weeklyMealData["Mẫu Giáo"][selectedDayName];
  }
} else {
  // Nếu là teacher/admin thì show cả 2 nhóm
  if (weeklyMealData["Nhà Trẻ"] && weeklyMealData["Nhà Trẻ"][selectedDayName]) {
    todayMeals["Nhà Trẻ"] = weeklyMealData["Nhà Trẻ"][selectedDayName];
  }
  if (weeklyMealData["Mẫu Giáo"] && weeklyMealData["Mẫu Giáo"][selectedDayName]) {
    todayMeals["Mẫu Giáo"] = weeklyMealData["Mẫu Giáo"][selectedDayName];
  }
}

  return (

    <div className="menu-container home">
      <BackButton />
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
          onChange={(e) => {
            setSelectedDate(e.target.value);
            // Reload data khi thay đổi ngày (nếu cần tuần mới)
            const newWeekStart = mealService.getWeekStart(e.target.value);
            const currentWeekStart = mealService.getWeekStart(selectedDate);
            if (newWeekStart !== currentWeekStart) {
              loadWeeklyMeals();
            }
          }}
        />
        <span className="weekday">{getDayOfWeek(selectedDate)}</span>
      </div>

      {/* Parent info display for debugging */}
      {user && user.role === 'parent' && childrenInfo.length > 0 && (
        <div className="parent-info" style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: '#f0f8ff', 
          border: '1px solid #ddd', 
          borderRadius: '5px' 
        }}>
          <p><strong>Thông tin con em:</strong></p>
          {childrenInfo.map((child, index) => (
            <p key={index} style={{ margin: '5px 0', fontSize: '14px' }}>
              • {child.full_name} - Nhóm: {child.nhom} - Lớp: {child.class_name}
            </p>
          ))}
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Filtering: {parentSecurityFilters.nhom || 'Tất cả nhóm'}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-message">
          Đang tải thực đơn...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadWeeklyMeals} className="retry-button">
            Thử lại
          </button>
        </div>
      )}

{/* Nội dung */}
{!loading && !error && (
  <>
    {activeTab === "ngay" ? (
      <div className="group-container">
        {todayMeals && Object.keys(todayMeals).length > 0 ? (
          // Nếu là parent thì chỉ render nhóm con
          user.role === "parent" && parentSecurityFilters.nhom ? (
            parentSecurityFilters.nhom === "nha_tre" && todayMeals["Nhà Trẻ"]
              ? renderGroup("Nhà Trẻ", todayMeals["Nhà Trẻ"])
              : parentSecurityFilters.nhom === "mau_giao" && todayMeals["Mẫu Giáo"]
              ? renderGroup("Mẫu Giáo", todayMeals["Mẫu Giáo"])
              : <div className="no-data-message">Không có dữ liệu thực đơn cho ngày này</div>
          ) : (
            // Nếu là teacher/admin thì render cả 2 nhóm
            Object.entries(todayMeals).map(([groupName, meals]) =>
              renderGroup(groupName, meals)
            )
          )
        ) : (
          <div className="no-data-message">
            Không có dữ liệu thực đơn cho ngày này
          </div>
        )}
      </div>
    ) : (
      <div className="week-view">
        {Object.keys(weeklyMealData).length > 0 ? (
          <>
            {user.role === "parent" && parentSecurityFilters.nhom ? (
              parentSecurityFilters.nhom === "nha_tre" && weeklyMealData["Nhà Trẻ"]
                ? renderWeekTable({ "Nhà Trẻ": weeklyMealData["Nhà Trẻ"] })
                : parentSecurityFilters.nhom === "mau_giao" && weeklyMealData["Mẫu Giáo"]
                ? renderWeekTable({ "Mẫu Giáo": weeklyMealData["Mẫu Giáo"] })
                : <div className="no-data-message">Không có dữ liệu thực đơn tuần này</div>
            ) : (
              renderWeekTable(weeklyMealData)
            )}
          </>
        ) : (
          <div className="no-data-message">
            Không có dữ liệu thực đơn tuần này
          </div>
        )}
      </div>
    )}
  </>
)}
    </div>
  );
}

export default Menu;
