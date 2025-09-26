import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <div className="header">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>
    </div>
  );
}

export default Header;