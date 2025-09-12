import React from "react";
import "../styles/login.css";   // đổi path css cho đúng

function Login() {
  return (
    <div className="login-page">
      <div className="login-box">
        {/* <img
          src="https://via.placeholder.com/60"
          alt="Logo Bunny"
          className="logo"
        /> */}
        <h2 className="title">Quản lý</h2>
        <p className="subtitle">dinh dưỡng mầm non</p>

        <form>
          <input type="text" placeholder="Tên đăng nhập" />
          <input type="password" placeholder="Mật khẩu" />

          <div className="captcha-group">
            <input type="text" placeholder="Nhập mã bảo vệ" />
            <span className="captcha">78a5</span>
          </div>

          <button type="submit">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default Login;