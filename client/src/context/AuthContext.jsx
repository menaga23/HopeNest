import React, { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

// Create the AuthContext
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate active token on initial page load
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error("Session verification failed. Token cleared.");
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // Handle user login authentication
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login failed. Please verify credentials.";
      return { success: false, error: errorMsg };
    }
  };

  // Handle user registration
  const register = async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      const { token, user: newUserData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(newUserData);
      return { success: true, user: newUserData };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Registration failed. Try again.";
      return { success: false, error: errorMsg };
    }
  };

  // Update profile details
  const updateProfile = async (profileData) => {
    try {
      const response = await API.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to update profile.";
      return { success: false, error: errorMsg };
    }
  };

  // Terminate user session
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
