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
  const [token, setToken] = useState(localStorage.getItem('authToken') || null); 
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const savedToken = authService.getToken();
        const savedUser = authService.getCurrentUser();

        if (savedToken && savedUser) {
          setUser(savedUser);
          setToken(savedToken);                
          setIsAuthenticated(true);

          try {
            const currentUser = await authService.fetchCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            }
          } catch (error) {
            console.warn('Token verification failed:', error);
          }
        } else {
          setUser(null);
          setToken(null);                      
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setUser(null);
        setToken(null);
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
        const { user, token } = response.data;

        setUser(user);
        setToken(token);                                     
        setIsAuthenticated(true);

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        return response;
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);                        
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');  
      localStorage.removeItem('user');
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,             
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

export default AuthContext;
