import React, { useState } from "react";
import "../styles/login.css";

function Login() {
  const generateCaptcha = () => {
    // tạo chuỗi captcha ngẫu nhiên gồm chữ + số (5 ký tự)
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [inputCaptcha, setInputCaptcha] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputCaptcha.toLowerCase() !== captcha.toLowerCase()) {
      setError("❌ Mã bảo vệ không đúng, vui lòng thử lại.");
      setCaptcha(generateCaptcha()); // tạo captcha mới
      setInputCaptcha(""); // reset ô nhập
    } else {
      setError(""); 
      alert("✅ Đăng nhập thành công!"); 
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="title">Quản lý</h2>
        <p className="subtitle">dinh dưỡng mầm non</p>

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Tên đăng nhập" />
          <input type="password" placeholder="Mật khẩu" />

          <div className="captcha-group">
            <input
              type="text"
              placeholder="Nhập mã bảo vệ"
              value={inputCaptcha}
              onChange={(e) => setInputCaptcha(e.target.value)}
            />
            <span className="captcha">{captcha}</span>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
