import React from "react";
import "./AccountInfo.css";

const AccountInfo = ({ role, account }) => {
  return (
    <div className="account-page">
      <h2 className="page-title">Thông tin tài khoản</h2>

      <div className="account-card">
        {role === "parent" && (
          <>
            <h3>Tài khoản phụ huynh</h3>
            <p><strong>Họ và tên:</strong> {account.fullname}</p>
            <p><strong>Email:</strong> {account.email}</p>
            <p><strong>Số điện thoại:</strong> {account.phone}</p>
            <p><strong>Con đang theo học:</strong> {account.childrenCount} bé</p>
            <p><strong>Lớp của con:</strong> {account.className}</p>
          </>
        )}

        {role === "teacher" && (
          <>
            <h3>Tài khoản giáo viên</h3>
            <p><strong>Họ và tên:</strong> {account.fullname}</p>
            <p><strong>Email:</strong> {account.email}</p>
            <p><strong>Số điện thoại:</strong> {account.phone}</p>
            <p><strong>Lớp phụ trách:</strong> {account.className}</p>
            <p><strong>Sĩ số học sinh:</strong> {account.studentsCount} em</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountInfo;
