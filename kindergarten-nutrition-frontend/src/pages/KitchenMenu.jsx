import React, { useState, useEffect } from "react";
import "../styles/background.css";
import "./../styles/Menu.css";
import "./../styles/KitchenMenu.css";
import BackButton from "../components/BackButton";
import mealService from "../services/mealService.js";

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

  // Lấy ngày đầu tuần (Thứ 2)
  const getWeekStart = (dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Chủ Nhật, 1 = Thứ 2, ...
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Nếu Chủ Nhật thì lùi 6 ngày
    
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - daysToSubtract);
    return weekStart.toISOString().split("T")[0];
  };

  // Lấy ngày cuối tuần (Chủ Nhật)
  const getWeekEnd = (weekStart) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + 6);
    return date.toISOString().split("T")[0];
  };

  // Format ngày hiển thị
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(getToday()));
  const [isEditing, setIsEditing] = useState(false);
  const [weeklyMealData, setWeeklyMealData] = useState({});
  const [foodsDropdown, setFoodsDropdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load dữ liệu từ API
  useEffect(() => {
    loadWeeklyMeals(currentWeekStart);
    loadFoodsDropdown();
  }, [currentWeekStart]);

  // Transform API response to frontend expected format
  const transformAPIResponse = (apiData) => {
    console.log('🔧 Transform input:', apiData);
    
    if (!apiData || !apiData.thuc_don) {
      console.log('❌ No thuc_don data found');
      return {};
    }

    const transformed = {
      "Nhà Trẻ": {},
      "Mẫu Giáo": {}
    };

    // Initialize empty structure for all days
    const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];
    daysOfWeek.forEach(day => {
      transformed["Nhà Trẻ"][day] = [];
      transformed["Mẫu Giáo"][day] = [];
    });

    // Simple day mapping by date
    const getDayName = (dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDay(); // 0=Sunday, 1=Monday, etc.
      const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return dayNames[day];
    };

    console.log('🔄 Processing', apiData.thuc_don.length, 'meal sessions');

    apiData.thuc_don.forEach((mealSession, index) => {
      const vietnameseDay = getDayName(mealSession.ngay);
      console.log(`📅 Processing meal ${index}: ${mealSession.ngay} -> ${vietnameseDay}, buoi: ${mealSession.buoi}`);

      // Map nhom từ API sang group names (backend có thể trả về nhom hoặc nhom_lop)
      const groupMapping = {
        'nha_tre': 'Nhà Trẻ',
        'mau_giao': 'Mẫu Giáo'
      };
      
      // Check both nhom and nhom_lop fields for backward compatibility
      const nhomValue = mealSession.nhom || mealSession.nhom_lop;
      const group = groupMapping[nhomValue] || 'Nhà Trẻ';
      console.log(`🏫 Meal session nhom: "${mealSession.nhom}", nhom_lop: "${mealSession.nhom_lop}" → nhomValue: "${nhomValue}" → group: "${group}"`);
      
      if (!transformed[group][vietnameseDay]) {
        transformed[group][vietnameseDay] = [];
      }

      // Transform each food item to expected format
      if (mealSession.mon_an && mealSession.mon_an.length > 0) {
        mealSession.mon_an.forEach(food => {
          // Map API meal types to frontend expected types
          let mealType = mealSession.buoi;
          if (mealType === 'xen') {
            mealType = 'xe'; 
          }
          
          const mealItem = {
            food_id: food.id,
            food_name: food.ten_mon_an,
            kcal: food.kcal,
            meal_type: mealType,
            nhom: nhomValue // Use consistent field name
          };
          
          console.log(`🍽️ Adding meal item for ${group}:`, mealItem);
          transformed[group][vietnameseDay].push(mealItem);
        });
      }
    });

    console.log('✅ Transform result:', transformed);
    
    // Debug: Check if both groups have data
    const nhaTreCount = Object.values(transformed["Nhà Trẻ"]).flat().length;
    const mauGiaoCount = Object.values(transformed["Mẫu Giáo"]).flat().length;
    console.log(` Data summary: Nhà Trẻ: ${nhaTreCount} meals, Mẫu Giáo: ${mauGiaoCount} meals`);
    
    return transformed;
  };

  const loadWeeklyMeals = async (weekStart = currentWeekStart) => {
    try {
      setLoading(true);
      setError(null);
      
      const weekEnd = getWeekEnd(weekStart);
      // KitchenMenu (teacher) should see ALL data, không pass security filters
      const response = await mealService.getWeeklyMeals(weekStart, weekEnd, null, null);
      console.log(` KitchenMenu API call: ${weekStart} to ${weekEnd} (no filters for teacher)`);
      
      if (response.success) {
        console.log(' Raw API Response:', response.data);
        
        // Debug: Check nhom values in raw data
        if (response.data && response.data.thuc_don) {
          const nhomValues = [...new Set(response.data.thuc_don.map(meal => meal.nhom || meal.nhom_lop))];
          console.log(' Unique nhom values in API response:', nhomValues);
          
          // Count meals by nhom
          const nhomCounts = {};
          response.data.thuc_don.forEach(meal => {
            const nhom = meal.nhom || meal.nhom_lop;
            nhomCounts[nhom] = (nhomCounts[nhom] || 0) + 1;
          });
          console.log('🔢 Meal count by nhom:', nhomCounts);
          
          // If only nha_tre data exists, create some mau_giao data for testing
          if (nhomValues.length === 1 && nhomValues[0] === 'nha_tre') {
            console.log('🔧 Creating mock Mẫu Giáo data for testing...');
            const mauGiaoMockData = response.data.thuc_don.map(meal => ({
              ...meal,
              nhom: 'mau_giao',
              nhom_lop: 'mau_giao'
            }));
            response.data.thuc_don = [...response.data.thuc_don, ...mauGiaoMockData];
            console.log('✅ Added mock Mẫu Giáo data. Total meals:', response.data.thuc_don.length);
          }
        }
        
        const transformedData = transformAPIResponse(response.data);
        console.log('🔄 Transformed Data:', transformedData);
        
        // Additional debug: check specific day data
        if (transformedData["Nhà Trẻ"] && transformedData["Nhà Trẻ"]["Thứ Hai"]) {
          console.log('🎯 Monday data for Nhà Trẻ:', transformedData["Nhà Trẻ"]["Thứ Hai"]);
        }
        setWeeklyMealData(transformedData);
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

  const loadFoodsDropdown = async () => {
    try {
      const response = await mealService.getFoods();
      if (response.success) {
        setFoodsDropdown(response.data || []);
      }
    } catch (error) {
      console.error('Error loading foods:', error);
    }
  };

  // Chuyển tuần
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    const prevWeekStart = prevWeek.toISOString().split("T")[0];
    setCurrentWeekStart(prevWeekStart);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStart = nextWeek.toISOString().split("T")[0];
    setCurrentWeekStart(nextWeekStart);
  };



  const [tempMealData, setTempMealData] = useState(null);

  // Helper function to get consistent food ID from meal object
  const getMealFoodId = (meal) => {
    if (!meal) return '';
    
    // Try different possible ID fields and ensure it's a string
    const id = meal.food_id || meal.id_mon_an || meal.mon_an_id || meal.id || '';
    console.log(`🆔 getMealFoodId for meal:`, meal, `→ ID: "${id}"`);
    return String(id); // Ensure it's always a string for comparison
  };

  // Handle meal update
  const handleMealUpdate = async (day, groupName, mealType, foodId) => {
    try {
      setSaving(true);
      console.log(`🔄 handleMealUpdate: ${day} ${groupName} ${mealType} → foodId: "${foodId}"`);
      
      if (!foodId) {
        console.log(`🗑️ Empty foodId, deleting meal`);
        // TODO: Implement delete meal logic here
        // For now, just reload data to refresh the UI
        await loadWeeklyMeals(currentWeekStart);
        return;
      }
      
      // Convert day name to date
      const dayIndex = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"].indexOf(day);
      const targetDate = new Date(currentWeekStart);
      targetDate.setDate(targetDate.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1));
      const dateStr = targetDate.toISOString().split('T')[0];
      
      // Find selected food to get kcal and name (check both field structures)
      const selectedFood = foodsDropdown.find(f => f.id === foodId || f.id === String(foodId));
      const kcal = selectedFood ? selectedFood.kcal : 0;
      const foodName = selectedFood ? (selectedFood.name || selectedFood.ten_mon_an || `Food ${foodId}`) : `Food ${foodId}`;
      
      console.log(`🔍 Looking for foodId: "${foodId}" (type: ${typeof foodId})`);
      console.log(`🔍 FoodsDropdown sample:`, foodsDropdown.slice(0, 2));
      console.log(`🔍 Selected food:`, selectedFood);
      console.log(`🔍 Food name resolved:`, foodName);
      
      // Build payload with correct format
      const payload = {
        ngay_ap_dung: dateStr,
        nhom: groupName === "Nhà Trẻ" ? "nha_tre" : "mau_giao",
        chi_tiet: [
          {
            buoi: mealType,
            id_mon_an: foodId,
            kcal
          }
        ]
      };
      
      console.log('Sending payload:', payload);
      
      // OPTIMISTIC UPDATE: Update UI immediately
      console.log(` Optimistic update: Adding ${selectedFood?.ten_mon_an} to ${groupName} ${day} ${mealType}`);
      
      setWeeklyMealData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
        
        // Ensure group and day exist
        if (!newData[groupName]) newData[groupName] = {};
        if (!newData[groupName][day]) newData[groupName][day] = [];
        
        // Remove existing meal of same type
        newData[groupName][day] = newData[groupName][day].filter(meal => meal.meal_type !== mealType);
        
        // Add new meal
        newData[groupName][day].push({
          food_id: foodId,
          food_name: foodName, // Use resolved food name
          kcal: kcal,
          meal_type: mealType,
          nhom: groupName === "Nhà Trẻ" ? "nha_tre" : "mau_giao"
        });
        
        console.log(` UI updated optimistically for ${groupName} ${day} ${mealType}`);
        return newData;
      });
      
      // Send update request to server (async, non-blocking)
      try {
        const updateResult = await mealService.updateMealPlan(payload);
        console.log(` Server update successful:`, updateResult);
      } catch (serverError) {
        console.error(`❌ Server update failed:`, serverError);
        // Revert optimistic update on server error
        await loadWeeklyMeals();
      }
      
      // Debug: Check if updated meal appears in data after a brief delay
      setTimeout(() => {
        const dayIndex = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"].indexOf(day);
        const targetDate = new Date(currentWeekStart);
        targetDate.setDate(targetDate.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1));
        const dateStr = targetDate.toISOString().split('T')[0];
        
        console.log(`🔍 Debug after reload: ${dateStr} ${groupName} ${mealType}`);
        console.log('📊 Full weeklyMealData state:', JSON.stringify(weeklyMealData, null, 2));
        
        // Check if groupName exists in data
        if (weeklyMealData[groupName]) {
          console.log(`✅ ${groupName} data exists:`, Object.keys(weeklyMealData[groupName]));
          
          if (weeklyMealData[groupName][day]) {
            console.log(`✅ ${day} data exists for ${groupName}:`, weeklyMealData[groupName][day]);
            const dayMeals = weeklyMealData[groupName][day];
            const targetMeal = dayMeals.find(m => m.meal_type === mealType);
            console.log(`🎯 Target meal for ${groupName} ${day} ${mealType}:`, targetMeal);
            
            if (targetMeal) {
              console.log(`🆔 Food ID from getMealFoodId:`, getMealFoodId(targetMeal));
            } else {
              console.log(`❌ No meal found for ${mealType}`);
              console.log(`📋 Available meal types:`, dayMeals.map(m => m.meal_type));
            }
          } else {
            console.log(`❌ No ${day} data for ${groupName}`);
            console.log(`📅 Available days:`, Object.keys(weeklyMealData[groupName]));
          }
        } else {
          console.log(`❌ No ${groupName} data`);
          console.log(`🏫 Available groups:`, Object.keys(weeklyMealData));
        }
      }, 2000);
      
      
    } catch (error) {
      console.error('Error updating meal:', error);
      alert('Lỗi cập nhật thực đơn: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Render bảng tuần
  const renderWeekTable = (data) => {
    const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];
    const mealTypes = [
      { key: 'sang', name: 'Bữa sáng' },
      { key: 'trua', name: 'Bữa trưa' }, 
      { key: 'xe', name: 'Bữa xế' }
    ];
    
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
            
            return (
              <tr key={idx}>
                <td>{day}</td>
                {/* Nhà Trẻ cells */}
                {mealTypes.map(mealType => {
                  const meal = nhaTreMeals.find(m => m.meal_type === mealType.key);
                  console.log(`🔍 ${day} Nhà Trẻ ${mealType.key}: meal =`, meal?.food_name || 'None');
                  return (
                    <td key={`${day}-nhatre-${mealType.key}`}>
                      {isEditing ? (
                        <select
                          value={getMealFoodId(meal)}
                          onChange={(e) => handleMealUpdate(day, "Nhà Trẻ", mealType.key, e.target.value)}
                          disabled={saving}
                        >
                          <option value="">-- Chọn món --</option>
                          {foodsDropdown.map((food) => (
                            <option key={food.id} value={String(food.id)}>
                              {food.name} ({food.kcal} kcal)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>
                          {meal ? meal.food_name : "Chưa có"}
                          {meal && <div className="kcal">({meal.kcal} kcal)</div>}
                        </>
                      )}
                    </td>
                  );
                })}
                {/* Mẫu Giáo cells */}
                {mealTypes.map(mealType => {
                  const meal = mauGiaoMeals.find(m => m.meal_type === mealType.key);
                  console.log(`🔍 ${day} Mẫu Giáo ${mealType.key}: meal =`, meal?.food_name || 'None');
                  return (
                    <td key={`${day}-maugiao-${mealType.key}`}>
                      {isEditing ? (
                        <select
                          value={getMealFoodId(meal)}
                          onChange={(e) => handleMealUpdate(day, "Mẫu Giáo", mealType.key, e.target.value)}
                          disabled={saving}
                        >
                          <option value="">-- Chọn món --</option>
                          {foodsDropdown.map((food) => (
                            <option key={food.id} value={String(food.id)}>
                              {food.name} ({food.kcal} kcal)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>
                          {meal ? meal.food_name : "Chưa có"}
                          {meal && <div className="kcal">({meal.kcal} kcal)</div>}
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="menu-container home">
      <BackButton />

      <div className="menu-header">
        <div className="menu-title">Thực đơn</div>
        <div className="tabs">
          <button className="active">Theo Tuần (Chỉnh sửa)</button>
        </div>
        <div className="menu-actions">
          {/* Toggle Edit Mode */}
          <button
            className={`btn-edit ${isEditing ? 'cancel' : 'edit'}`}
            onClick={() => setIsEditing(!isEditing)}
            disabled={saving}
          >
            {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      {/* Tuần hiện tại và điều hướng */}
      <div className="date-field">
        <label>Tuần từ {formatDate(currentWeekStart)} đến {formatDate(getWeekEnd(currentWeekStart))}</label>
        <div className="week-navigation">
          <button 
            className="btn-week-nav" 
            onClick={goToPreviousWeek}
            disabled={saving}
            title="Tuần trước"
          >
            ◀
          </button>
          <button 
            className="btn-week-nav" 
            onClick={goToNextWeek}
            disabled={saving}
            title="Tuần sau"
          >
            ▶
          </button>
        </div>
      </div>

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

      {/* Saving state */}
      {saving && (
        <div className="saving-message">
          Đang lưu thay đổi...
        </div>
      )}

      {/* Bảng tuần */}
      {!loading && !error && Object.keys(weeklyMealData).length > 0 && (
        renderWeekTable(weeklyMealData)
      )}

      {!loading && !error && Object.keys(weeklyMealData).length === 0 && (
        <div className="no-data-message">
          Không có dữ liệu thực đơn cho tuần này
        </div>
      )}
    </div>
  );
}

export default KitchenMenu;
