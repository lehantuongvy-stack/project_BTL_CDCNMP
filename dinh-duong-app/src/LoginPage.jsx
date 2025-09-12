import React, { useState } from "react";
import "./LoginPage.css"; // import CSS riêng

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo Bunny */}
        <div className="logo">
          <img src="/cookie-bunny.png" alt="Logo Bunny" />
        </div>

        {/* Title */}
        <h2 className="title">Quản lý</h2>
        <h3 className="subtitle">dinh dưỡng mầm non</h3>

        {/* Input Container */}
        <div className="input-container">
          {/* Username */}
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Captcha */}
        <div className="input-container">
          <div className="captcha-container">
            <input
              type="text"
              placeholder="Nhập mã bảo vệ"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
            />
            <span className="captcha-code">78a5</span>
          </div>
        </div>

        {/* Button */}
        <button className="login-btn">ĐĂNG NHẬP</button>
      </div>
    </div>
  );
}