import React from 'react';
import UserManagement from '../users/UserManagement.jsx';

const ParentManagement = () => {
  return (
    <UserManagement 
      role="parent" 
      title="Quản lý phụ huynh" 
    />
  );
};

export default ParentManagement;