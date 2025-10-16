import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check role if required
  if (requiredRole) {
    // Support both string and array of roles
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(user?.role)) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center'
        }}>
          <h2>Không có quyền truy cập</h2>
          <p>Bạn không có quyền truy cập vào trang này.</p>
          <button 
            onClick={() => window.history.back()}
            style={{
              padding: '0.5rem 1rem',
              background: '#ffced2',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Quay lại
          </button>
        </div>
      );
    }
  }
  return children;
}

export default ProtectedRoute;