import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, isAuthenticated, login, logout, register } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = () => {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Login user
  const loginUser = async (credentials) => {
    try {
      const data = await login(credentials);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Register user
  const registerUser = async (userData) => {
    try {
      const data = await register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout user
  const logoutUser = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);