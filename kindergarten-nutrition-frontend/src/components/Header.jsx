import React from "react";
import "./header.css"; 

function Header() {
  // hàm quay lại
  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="container">
      <button className="back-btn" onClick={handleBack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          fill="white"
          viewBox="0 0 24 24">
          <path 
            d="M15 18l-6-6 6-6" 
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
    </div>
  );
};

export default Header;
