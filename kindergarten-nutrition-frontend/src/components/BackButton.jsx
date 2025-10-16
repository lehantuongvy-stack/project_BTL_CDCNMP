import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

function BackButton({ to }) {
  const handleBack = () => {
    if (to) {
      window.location.href = to; // chuyển đến đường dẫn được truyền
    } else {
      window.history.back(); // quay lại trang trước
    }
  };

  return (
    <button className="back-btn" onClick={handleBack}>
      <FaArrowLeft />
    </button>
  );
}

export default BackButton;
