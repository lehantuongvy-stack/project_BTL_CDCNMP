import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import mealService from '../services/mealService.js';
import '../styles/background.css';
import '../styles/Home.css';

function MenuSection({ title, meals, userRole, navigate }) {
  return (
    <div className="menu-section-home">
      <h4>{title}</h4>
      {Object.entries(meals).map(([mealTime, dishes], index) => (
        <p key={index}>
          <b>{mealTime}</b><br />
          {Array.isArray(dishes) ? dishes.join(", ") : dishes || "Chưa có dữ liệu"}
        </p>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy ngày hôm nay
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Lấy thực đơn hôm nay
  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const today = getToday();
        console.log('🏠 Fetching menu for today:', today);
        
        const response = await mealService.getDailyMeals(today);
        console.log('🏠 Menu response:', response);
        
        if (response.success && response.data) {
          // Chuyển đổi dữ liệu API thành format cho component
          const convertedData = convertApiDataToMenuFormat(response.data);
          setMenuData(convertedData);
        } else {
          // Fallback data nếu không có dữ liệu
          setMenuData([
            {
              title: "Nhà trẻ",
              meals: {
                Sáng: "Chưa có dữ liệu",
                Trưa: "Chưa có dữ liệu", 
                Chiều: "Chưa có dữ liệu"
              }
            },
            {
              title: "Mẫu giáo",
              meals: {
                Sáng: "Chưa có dữ liệu",
                Trưa: "Chưa có dữ liệu",
                Chiều: "Chưa có dữ liệu"
              }
            }
          ]);
        }
      } catch (error) {
        console.error('🏠 Error fetching today menu:', error);
        setError('Không thể tải thực đơn hôm nay');
        // Fallback data khi có lỗi
        setMenuData([
          {
            title: "Nhà trẻ", 
            meals: {
              Sáng: "Lỗi tải dữ liệu",
              Trưa: "Lỗi tải dữ liệu",
              Chiều: "Lỗi tải dữ liệu"
            }
          },
          {
            title: "Mẫu giáo",
            meals: {
              Sáng: "Lỗi tải dữ liệu", 
              Trưa: "Lỗi tải dữ liệu",
              Chiều: "Lỗi tải dữ liệu"
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMenu();
  }, []);

  // Hàm chuyển đổi dữ liệu API thành format cho component
  const convertApiDataToMenuFormat = (apiData) => {
    console.log('🔄 Converting API data:', apiData);
    
    const nhaTreData = { Sáng: '', Trưa: '', Chiều: '' };
    const mauGiaoData = { Sáng: '', Trưa: '', Chiều: '' };

    // Duyệt qua các key trong API data (format: {loai_bua_an}_{lop_ap_dung})
    Object.keys(apiData).forEach(key => {
      const mealInfo = apiData[key];
      console.log(`🔄 Processing key: ${key}`, mealInfo);
      
      if (mealInfo && mealInfo.mon_an_list && mealInfo.mon_an_list.length > 0) {
        const dishNames = mealInfo.mon_an_list.map(dish => dish.ten_mon_an).join(', ');
        
        // Parse key để lấy loai_bua_an và lop_ap_dung
        const [loaiBuaAn, lopApDung] = key.split('_');
        
        // Map meal types
        let mealTime = '';
        if (loaiBuaAn === 'breakfast') mealTime = 'Sáng';
        else if (loaiBuaAn === 'lunch') mealTime = 'Trưa';
        else if (loaiBuaAn === 'dinner') mealTime = 'Chiều';
        
        // Assign to correct group
        if (lopApDung === 'nha' && key.includes('nha_tre')) {
          if (mealTime) nhaTreData[mealTime] = dishNames;
        } else if (lopApDung === 'mau' && key.includes('mau_giao')) {
          if (mealTime) mauGiaoData[mealTime] = dishNames;
        } else if (lopApDung === 'nha_tre') {
          if (mealTime) nhaTreData[mealTime] = dishNames;
        } else if (lopApDung === 'mau_giao') {
          if (mealTime) mauGiaoData[mealTime] = dishNames;
        }
      }
    });

    // Set default messages for empty meals
    Object.keys(nhaTreData).forEach(mealTime => {
      if (!nhaTreData[mealTime]) nhaTreData[mealTime] = 'Chưa có món ăn';
    });
    Object.keys(mauGiaoData).forEach(mealTime => {
      if (!mauGiaoData[mealTime]) mauGiaoData[mealTime] = 'Chưa có món ăn';  
    });

    return [
      {
        title: "Nhà trẻ",
        meals: nhaTreData
      },
      {
        title: "Mẫu giáo", 
        meals: mauGiaoData
      }
    ];
  };

  return (
    <div className="home">
      <Header />
      <div className="home-container">
        <div className="content-home">
          {/* Sidebar trái - hiển thị cho cả phụ huynh và giáo viên */}
          <aside className="sidebar-left-home">
            <div className="contact-home">
              <h3>Điện thoại</h3>
              <p>Trường mầm non ABC</p>
              <p>(08) 38.000.000</p>
            </div>
            {/* Nút báo cáo chỉ hiển thị cho giáo viên */}
            {user?.role === 'teacher' && (
              <button className="report-btn-home">BÁO CÁO</button>
            )}
          </aside>

          {/* Khu vực chính */}
          <main className="main-area-home">
            <div className="news-grid">
              <a
                href="https://baomoi.com/cac-nhom-chat-dinh-duong-can-thiet-cho-tre-mam-non-c53117200.epi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news1.jpg" alt="Tin tức 1" />
              </a>

              <a
                href="https://thanhnien.vn/dinh-duong-cho-tre-tags572210.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news2.jpg" alt="Tin tức 2" />
              </a>

              <a
                href="https://bvquan5.medinet.gov.vn/chuyen-muc/cac-nhom-chat-dinh-duong-can-thiet-cho-tre-mam-non-cmobile16572-244790.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news3.jpg" alt="Tin tức 3" />
              </a>

              <a
                href="https://moh.gov.vn/hoat-dong-cua-dia-phuong/-/asset_publisher/gHbla8vOQDuS/content/cham-soc-suc-khoe-cho-tre-mam-non-au-nam-hoc-moi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/news4.jpg" alt="Tin tức 4" />
              </a>
            </div>
          </main>

          {/* Sidebar phải */}
          <aside className="sidebar-right-home">
            <h3>THỰC ĐƠN HÔM NAY</h3>
            {loading ? (
              <div className="loading-menu">Đang tải thực đơn...</div>
            ) : error ? (
              <div className="error-menu">
                <p>{error}</p>
                <p><small>Hiển thị dữ liệu mặc định</small></p>
              </div>
            ) : null}
            
            {menuData.map((menu, index) => (
              <MenuSection 
                key={index} 
                title={menu.title} 
                meals={menu.meals}
                userRole={user?.role}
                navigate={navigate}
              />
            ))}
            
            {/* Nút Chi tiết Thực đơn - chỉ hiển thị cho teacher */}
            {user?.role === 'teacher' && (
              <button 
                className="menu-detail-btn"
                onClick={() => navigate('/kitchen-menu')}
              >
                Chi tiết Thực đơn
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
