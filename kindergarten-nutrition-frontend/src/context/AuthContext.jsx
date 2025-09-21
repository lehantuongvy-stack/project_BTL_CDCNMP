import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

// Tạo AuthContext
const AuthContext = createContext();

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra token và user trong localStorage
        const token = authService.getToken();
        const savedUser = authService.getCurrentUser();
        
        if (token && savedUser) {
          // Verify token với server
          const currentUser = await authService.fetchCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Token không hợp lệ, clear data
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      setLoading(true);
      await authService.logout();
      console.log('✅ Logout API call completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      console.log('🔄 Clearing user state...');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      console.log('✅ User state cleared, isAuthenticated:', false);
    }
  };

  // Update user function
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};