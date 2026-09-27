import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData) => {
    return await authService.register(registrationData);
  };

  const verifyOtp = async (email, otpCode) => {
    setLoading(true);
    try {
      const data = await authService.verifyEmailOtp(email, otpCode);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    return await authService.resendOtp(email);
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (email, token, newPassword) => {
    return await authService.resetPassword(email, token, newPassword);
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role) || user.roles.includes('PLATFORM_ADMIN') || user.roles.includes('ROLE_PLATFORM_ADMIN');
  };

  const hasPermission = (perm) => {
    if (!user) return false;
    if (user.roles?.includes('PLATFORM_ADMIN') || user.roles?.includes('ROLE_PLATFORM_ADMIN')) return true;
    if (!user.permissions) return false;
    return user.permissions.includes(perm);
  };

  const isAuthenticated = !!user && !!authService.getToken();

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      changePassword,
      logout,
      hasRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
