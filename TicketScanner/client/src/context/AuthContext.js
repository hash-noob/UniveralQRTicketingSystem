import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if there's a token in localStorage on app start
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        let token = localStorage.getItem('auth_token');
        
        if (token) {
          // Set auth token header
          setAuthToken(token);
          
          // Verify token is valid by getting current user
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cypherscanner-api.vercel.app/api/';
          const res = await axios.get(`${API_BASE_URL}auth/me`);
          
          if (res.data.success) {
            setCurrentUser(res.data.data.user);
          } else {
            // Token might be invalid or expired
            localStorage.removeItem('auth_token');
            setAuthToken(null);
          }
        }
      } catch (err) {
        // Token validation failed
        localStorage.removeItem('auth_token');
        setAuthToken(null);
        console.error('Error validating token:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Set auth token helper
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cypherscanner-api.vercel.app/api/';
      const res = await axios.post(`${API_BASE_URL}auth/login`, {
        username,
        password
      });
      
      if (res.data.success) {
        // Set token in localStorage
        const { token, user } = res.data.data;
        localStorage.setItem('auth_token', token);
        
        // Set token in axios headers
        setAuthToken(token);
        
        // Update state
        setCurrentUser(user);
      }
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    
    // Remove token from axios headers
    setAuthToken(null);
    
    // Update state
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        logout,
        isAdmin: currentUser?.isAdmin || false,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 