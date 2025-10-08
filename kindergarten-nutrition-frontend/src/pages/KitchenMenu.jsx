import React, { useState, useEffect } from "react";
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
  const [dishList, setDishList] = useState([]); // Danh sách món ăn từ database
  const [weeklyMealData, setWeeklyMealData] = useState({});
  const [tempMealData, setTempMealData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // Thông tin user đăng nhập
  
  // States for delete functionality
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSelection, setDeleteSelection] = useState({
    mealType: 'breakfast', // breakfast, lunch, dinner
    groupType: 'Nhà Trẻ'   // Nhà Trẻ, Mẫu Giáo
  });

  // API base URL
  const API_BASE_URL = 'http://localhost:3002/api';

  // Helper function để lấy headers với token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); // Sửa key từ 'token' thành 'authToken'
    console.log('🔍 Getting token from localStorage:', token); // Debug log
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Lấy thông tin user từ token
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Sửa từ 'token' thành 'authToken'
      console.log('Token from localStorage:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('No token found, user not logged in');
        return;
      }

      console.log('Fetching user info...');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      console.log('User info response:', result);
      
      if (result.success) {
        setUserInfo(result.data);
        console.log('User info set:', result.data);
      } else {
        console.error('Failed to get user info:', result.message);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Lấy danh sách món ăn từ API
  const fetchDishes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/dishes`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setDishList(result.data);
      } else {
        console.error('Failed to fetch dishes:', result.message);
        if (result.message?.includes('Token') || result.message?.includes('đăng nhập')) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      alert('Lỗi khi lấy danh sách món ăn');
    }
  };

  // Lấy thực đơn theo ngày
  const fetchMenuByDate = async (date) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/meals/by-date/${date}`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      console.log('🍽️ API Response for date:', date, result);
      
      if (result.success) {
        console.log('📊 API Data:', result.data);
        // Convert API data to component format
        const convertedData = convertApiDataToComponentFormat(result.data);
        console.log('🔄 Converted Data:', convertedData);
        
        const dayName = getDayOfWeek(date);
        setWeeklyMealData(prev => {
          const newWeeklyMealData = {
            ...prev,
            [dayName]: convertedData
          };
          
          console.log('📅 Setting weeklyMealData for day:', dayName);
          console.log('🗂️ New weeklyMealData:', newWeeklyMealData);
          
          return newWeeklyMealData;
        });
        

      } else {
        console.error('Failed to fetch menu:', result.message);
        if (result.message?.includes('Token') || result.message?.includes('đăng nhập')) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
    } catch (error) {
      console.error('Error fetching menu by date:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert API data format to component format
  const convertApiDataToComponentFormat = (apiData) => {
    const converted = {
      "Nhà Trẻ": [
        { title: "Bữa sáng", dish: "", kcal: 0, menuId: null, dishes: [] },
        { title: "Bữa trưa", dish: "", kcal: 0, menuId: null, dishes: [] },
        { title: "Bữa xế", dish: "", kcal: 0, menuId: null, dishes: [] }
      ],
      "Mẫu Giáo": [
        { title: "Bữa sáng", dish: "", kcal: 0, menuId: null, dishes: [] },
        { title: "Bữa trưa", dish: "", kcal: 0, menuId: null, dishes: [] },
        { title: "Bữa xế", dish: "", kcal: 0, menuId: null, dishes: [] }
      ]
    };

    // Process API data and map to component format
    console.log('🔍 Processing API Data keys:', Object.keys(apiData));
    Object.keys(apiData).forEach(key => {
      const menu = apiData[key];
      console.log(`📋 Processing menu key: ${key}`, menu);
      
      // Kiểm tra xem menu có dữ liệu không
      if (!menu || !menu.thuc_don_info) {
        console.log('❌ Menu data not found for key:', key);
        return;
      }
      
      const { loai_bua_an, nhom_lop, mon_an_list = [] } = menu.thuc_don_info;
      console.log(`📝 Menu details - loai_bua_an: ${loai_bua_an}, nhom_lop: "${nhom_lop}"`);
      console.log(`🍱 mon_an_list:`, menu.mon_an_list);
      
      const lopGroup = nhom_lop === 'nha_tre' ? 'Nhà Trẻ' : 'Mẫu Giáo';
      console.log(`🔄 nhom_lop "${nhom_lop}" === 'nha_tre'? ${nhom_lop === 'nha_tre'}`);
      console.log(`➡️ Final lopGroup: "${lopGroup}"`);
      console.log(`🎯 DEBUG CRITICAL - Raw nhom_lop value: [${typeof nhom_lop}] "${nhom_lop}"`);
      console.log(`🎯 DEBUG CRITICAL - String comparison 'nha_tre': ${JSON.stringify(nhom_lop)} === ${JSON.stringify('nha_tre')}`);
      console.log(`🎯 DEBUG CRITICAL - Will be mapped to: "${lopGroup}"`);
      const mealIndex = loai_bua_an === 'breakfast' ? 0 : 
                       loai_bua_an === 'lunch' ? 1 : 
                       loai_bua_an === 'dinner' ? 2 : 0;
      console.log(`🎯 Mapping to lopGroup: ${lopGroup}, mealIndex: ${mealIndex}`);
      
      if (converted[lopGroup] && converted[lopGroup][mealIndex]) {
        // Use mon_an_list from menu.mon_an_list instead of thuc_don_info
        const dishes = menu.mon_an_list || [];
        console.log(`🍽️ Using dishes:`, dishes);
        
        // Combine dish names and calculate calories per serving (not total)
        const dishNames = dishes.map(item => item.ten_mon_an).join(', ');
        const totalKcal = dishes.reduce((sum, item) => 
          sum + (item.calories_per_serving || 0), 0 // Only calories_per_serving, not multiply by so_khau_phan
        );
        
        console.log(`🏷️ dishNames: "${dishNames}", totalKcal per serving: ${totalKcal}`);
        
        converted[lopGroup][mealIndex] = {
          ...converted[lopGroup][mealIndex],
          dish: dishNames,
          kcal: Math.round(totalKcal),
          menuId: menu.thuc_don_info.id,
          dishes: dishes
        };
        
        console.log(`✅ Updated converted[${lopGroup}][${mealIndex}]:`, converted[lopGroup][mealIndex]);
      }
    });

    return converted;
  };

  // Tạo hoặc cập nhật thực đơn
  const saveMenu = async (menuData) => {
    try {
      const url = menuData.id ? 
        `${API_BASE_URL}/meals/${menuData.id}` : 
        `${API_BASE_URL}/meals`;
      
      const method = menuData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(menuData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error saving menu:', error);
      throw error;
    }
  };

  // Xóa thực đơn
  const deleteMenu = async (menuId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${menuId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  };

  // Handle delete menu
  const handleDeleteMenu = async () => {
    try {
      setLoading(true);
      const currentDayName = getDayOfWeek(selectedDate);
      const dayData = weeklyMealData[currentDayName];
      
      if (!dayData) {
        alert('Không có thực đơn để xóa');
        return;
      }
      
      const { mealType, groupType } = deleteSelection;
      const mealIndex = mealType === 'breakfast' ? 0 : 
                      mealType === 'lunch' ? 1 : 2;
      
      const mealData = dayData[groupType]?.[mealIndex];
      
      if (!mealData || !mealData.menuId) {
        alert('Không tìm thấy thực đơn để xóa');
        return;
      }
      
      // Confirm delete
      const confirmDelete = window.confirm(
        `Bạn có chắc chắn muốn xóa thực đơn "${mealData.dish}" cho ${groupType} - ${mealType === 'breakfast' ? 'Bữa sáng' : mealType === 'lunch' ? 'Bữa trưa' : 'Bữa xế'}?`
      );
      
      if (!confirmDelete) return;
      
      // Delete from backend
      await deleteMenu(mealData.menuId);
      
      // Refresh data
      await fetchMenuByDate(selectedDate);
      
      alert('Xóa thực đơn thành công!');
      setShowDeleteModal(false);
      
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Lỗi khi xóa thực đơn: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchUserInfo();
    fetchDishes();
    fetchMenuByDate(selectedDate);
  }, []);

  // Load menu when date changes
  useEffect(() => {
    fetchMenuByDate(selectedDate);
  }, [selectedDate]);

  // Get dishes by meal type
  const getDishesByMealType = (mealTitle) => {
    const mealTypeMap = {
      "Bữa sáng": "main_dish",
      "Bữa trưa": "main_dish", 
      "Bữa xế": "snack"
    };
    
    const mealType = mealTypeMap[mealTitle];
    return dishList.filter(dish => 
      dish.loai_mon_an === mealType || dish.loai_mon_an === '' || dish.loai_mon_an === null
    );
  };

  // Handle dish selection change - add dish to array instead of replacing
  const handleDishChange = (day, group, index, selectedDishId) => {
    if (!selectedDishId) return; // Don't do anything if no dish selected
    
    setTempMealData((prev) => {
      const updated = { ...prev };
      const selectedDish = dishList.find(dish => dish.id === selectedDishId);
      
      if (selectedDish) {
        // Initialize dishes array if not exists
        if (!updated[day][group][index].dishes) {
          updated[day][group][index].dishes = [];
        }
        
        // Check if dish already exists in the list
        const existingDishIndex = updated[day][group][index].dishes.findIndex(
          dish => dish.id === selectedDishId
        );
        
        if (existingDishIndex === -1) {
          // Add new dish to the list
          updated[day][group][index].dishes.push({
            id: selectedDish.id,
            ten_mon_an: selectedDish.ten_mon_an,
            calories_per_serving: selectedDish.calories_per_serving,
            loai_mon_an: selectedDish.loai_mon_an
          });
          
          // Update combined display text and total calories
          const dishNames = updated[day][group][index].dishes.map(dish => dish.ten_mon_an);
          const totalKcal = updated[day][group][index].dishes.reduce((sum, dish) => 
            sum + (dish.calories_per_serving || 0), 0
          );
          
          updated[day][group][index] = {
            ...updated[day][group][index],
            dish: dishNames.join(', '),
            kcal: totalKcal
          };
        }
      }
      
      return updated;
    });
  };

  // Remove dish from meal by index
  const handleRemoveDish = (day, group, mealIndex, dishIndex) => {
    setTempMealData((prev) => {
      const updated = { ...prev };
      
      if (updated[day][group][mealIndex].dishes && updated[day][group][mealIndex].dishes.length > dishIndex) {
        // Remove dish at specific index
        updated[day][group][mealIndex].dishes.splice(dishIndex, 1);
        
        // Update combined display text and total calories
        const remainingDishes = updated[day][group][mealIndex].dishes;
        const dishNames = remainingDishes.map(dish => dish.ten_mon_an);
        const totalKcal = remainingDishes.reduce((sum, dish) => 
          sum + (dish.calories_per_serving || 0), 0
        );
        
        updated[day][group][mealIndex] = {
          ...updated[day][group][mealIndex],
          dish: dishNames.length > 0 ? dishNames.join(', ') : '',
          kcal: totalKcal
        };
      }
      
      return updated;
    });
  };

  // Save all changes
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Debug user info
      console.log('Current userInfo:', userInfo);
      console.log('userInfo?.user?.id:', userInfo?.user?.id);
      
      // Kiểm tra user đã đăng nhập chưa
      if (!userInfo?.user?.id) {
        console.log('User not logged in or no user ID');
        
        // Thử fetch user info một lần nữa
        console.log('Trying to fetch user info again...');
        await fetchUserInfo();
        
        // Nếu vẫn không có, thử decode token trực tiếp
        if (!userInfo?.user?.id) {
          const token = localStorage.getItem('authToken'); // Sửa từ 'token' thành 'authToken'
          if (token) {
            try {
              // Decode JWT token để lấy user info
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.log('Token payload:', payload);
              
              if (payload.id) {
                // Tạm thời set userInfo từ token với cấu trúc đúng
                setUserInfo({ user: { id: payload.id, username: payload.username, role: payload.role } });
                console.log('Set userInfo from token:', { id: payload.id, username: payload.username, role: payload.role });
              } else {
                alert('Vui lòng đăng nhập để lưu thực đơn');
                return;
              }
            } catch (e) {
              console.error('Error decoding token:', e);
              alert('Vui lòng đăng nhập để lưu thực đơn');
              return;
            }
          } else {
            alert('Vui lòng đăng nhập để lưu thực đơn');
            return;
          }
        }
      }
      
      const promises = [];
      const currentDayName = getDayOfWeek(selectedDate);
      
      console.log('💿 Before saving - tempMealData:', tempMealData);
      console.log('📅 Current day name:', currentDayName);
      
      if (tempMealData && tempMealData[currentDayName]) {
        const dayData = tempMealData[currentDayName];
        console.log('📊 Day data to save:', dayData);
        console.log('🏠 Nhà Trẻ meals to save:', dayData["Nhà Trẻ"]);
        console.log('🎓 Mẫu Giáo meals to save:', dayData["Mẫu Giáo"]);
        
        Object.keys(dayData).forEach(group => {
          console.log(`🔄 Processing group: "${group}" with ${dayData[group].length} meals`);
          dayData[group].forEach((meal, index) => {
            // Check if meal has dishes array with at least one dish
            if (meal.dishes && meal.dishes.length > 0) {
              // Debug: Log group value to see exact string
              console.log(`🐛 DEBUG - Raw group value: "${group}" (length: ${group.length})`);
              console.log(`🐛 DEBUG - Group === 'Nhà Trẻ':`, group === 'Nhà Trẻ');
              console.log(`🐛 DEBUG - Group.trim() === 'Nhà Trẻ':`, group.trim() === 'Nhà Trẻ');
              
              // More robust mapping with explicit checks
              let nhomLop;
              if (group.trim() === 'Nhà Trẻ') {
                nhomLop = 'nha_tre';
              } else if (group.trim() === 'Mẫu Giáo') {
                nhomLop = 'mau_giao';
              } else {
                console.warn(`⚠️ Unknown group: "${group}", defaulting to mau_giao`);
                nhomLop = 'mau_giao';
              }
              
              const loaiBuaAn = meal.title === 'Bữa sáng' ? 'breakfast' : 
                               meal.title === 'Bữa trưa' ? 'lunch' : 'dinner';
              
              console.log(`💾 Saving menu - group: "${group}", nhomLop: "${nhomLop}", loaiBuaAn: "${loaiBuaAn}"`);
              console.log(`🍽️ Dishes to save:`, meal.dishes);
              
              const menuData = {
                id: meal.menuId || null,
                ten_thuc_don: `${meal.title} - ${group} - ${selectedDate}`,
                ngay_ap_dung: selectedDate,
                loai_bua_an: loaiBuaAn,
                nhom_lop: nhomLop,
                so_tre_du_kien: 30,
                trang_thai: 'active',
                ghi_chu: '', // Explicitly set to empty string
                // created_by sẽ được server tự động thêm từ token
                mon_an_list: meal.dishes.map(dish => ({
                  mon_an_id: dish.id,
                  so_khau_phan: 30,
                  ghi_chu: ''
                }))
              };
              
              promises.push(saveMenu(menuData));
            }
          });
        });
      }
      
      await Promise.all(promises);
      
      // Refresh data
      await fetchMenuByDate(selectedDate);
      
      setTempMealData(null);
      setIsEditing(false);
      alert('Lưu thực đơn thành công!');
      
    } catch (error) {
      console.error('Error saving menus:', error);
      alert('Lỗi khi lưu thực đơn: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render table
  const renderWeekTable = (data) => {
    const currentDayName = getDayOfWeek(selectedDate);
    console.log('📋 renderWeekTable - currentDayName:', currentDayName);
    console.log('📋 renderWeekTable - input data:', data);
    
    const dayData = data[currentDayName] || {
      "Nhà Trẻ": [
        { title: "Bữa sáng", dish: "", kcal: 0 },
        { title: "Bữa trưa", dish: "", kcal: 0 },
        { title: "Bữa xế", dish: "", kcal: 0 }
      ],
      "Mẫu Giáo": [
        { title: "Bữa sáng", dish: "", kcal: 0 },
        { title: "Bữa trưa", dish: "", kcal: 0 },
        { title: "Bữa xế", dish: "", kcal: 0 }
      ]
    };
    
    console.log('📊 renderWeekTable - dayData:', dayData);
    console.log('🏠 Nhà Trẻ data:', dayData["Nhà Trẻ"]);
    console.log('🎓 Mẫu Giáo data:', dayData["Mẫu Giáo"]);

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
          <tr>
            <td>{currentDayName}</td>
            {["Nhà Trẻ", "Mẫu Giáo"].map((group) =>
              dayData[group].map((meal, i) => (
                <td key={group + i}>
                  {isEditing ? (
                    <div className="meal-editor">
                      {/* Display selected dishes */}
                      {meal.dishes && meal.dishes.length > 0 && (
                        <div className="selected-dishes">
                          {meal.dishes.map((dish, dishIndex) => (
                            <div key={`${dish.id}-${dishIndex}`} className="selected-dish-item">
                              <span className="dish-name">{dish.ten_mon_an}</span>
                              <span className="dish-kcal">({dish.calories_per_serving} kcal)</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Dropdown to add new dishes */}
                      <select
                        value=""
                        onChange={(e) => {
                          handleDishChange(currentDayName, group, i, e.target.value);
                          e.target.value = ""; // Reset dropdown after selection
                        }}
                        className="dish-selector"
                      >
                        <option value="">-- Thêm món ăn --</option>
                        {getDishesByMealType(meal.title).map((dish) => (
                          <option key={dish.id} value={dish.id}>
                            {dish.ten_mon_an} ({dish.calories_per_serving} kcal)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="meal-display">
                      {meal.dishes && meal.dishes.length > 0 ? (
                        <div className="dishes-list">
                          {meal.dishes.map((dish, dishIndex) => (
                            <div key={`view-${dish.id}-${dishIndex}`} className="dish-item">
                              <div className="dish-name">{dish.ten_mon_an}</div>
                              <div className="dish-kcal">({dish.calories_per_serving} kcal)</div>
                            </div>
                          ))}
                          <div className="total-kcal">Tổng: ({meal.kcal} kcal)</div>
                        </div>
                      ) : (
                        <div className="no-menu">Chưa có thực đơn</div>
                      )}
                    </div>
                  )}
                </td>
              ))
            )}
          </tr>
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
          <button className="active">Theo Ngày</button>
        </div>
        <div className="menu-actions">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={loading || !isEditing}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>

          <button
            className="btn-delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              marginLeft: '8px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Xóa
          </button>

          <button
            className="btn-edit"
            onClick={() => {
              if (isEditing) {
                setTempMealData(null);
                setIsEditing(false);
              } else {
                setTempMealData(JSON.parse(JSON.stringify(weeklyMealData)));
                setIsEditing(true);
              }
            }}
            disabled={loading}
          >
            {isEditing ? "Hủy" : "Sửa"}
          </button>
        </div>
      </div>

      <div className="date-field">
        <label htmlFor="date">Ngày:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          disabled={loading}
        />
        <span className="weekday">{getDayOfWeek(selectedDate)}</span>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        (() => {
          const dataToRender = isEditing ? tempMealData : weeklyMealData;
          console.log('🖼️ Rendering table with data:', dataToRender);
          console.log('🔄 isEditing:', isEditing);
          return renderWeekTable(dataToRender);
        })()
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginTop: 0, color: '#dc3545' }}>Xóa Thực Đơn</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Chọn bữa ăn:
              </label>
              <select
                value={deleteSelection.mealType}
                onChange={(e) => setDeleteSelection(prev => ({ ...prev, mealType: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="breakfast">Bữa sáng</option>
                <option value="lunch">Bữa trưa</option>
                <option value="dinner">Bữa xế</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Chọn nhóm lớp:
              </label>
              <select
                value={deleteSelection.groupType}
                onChange={(e) => setDeleteSelection(prev => ({ ...prev, groupType: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="Nhà Trẻ">Nhà Trẻ</option>
                <option value="Mẫu Giáo">Mẫu Giáo</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteMenu}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KitchenMenu;
