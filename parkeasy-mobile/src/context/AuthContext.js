import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios base URL for your backend
const API_BASE_URL = 'http://192.168.40.121:3000/api'; // Updated to use your computer's IP
axios.defaults.baseURL = API_BASE_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        await fetchUserProfile(storedToken);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
    setLoading(false);
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await axios.get('/auth/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      await logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;
      
      await SecureStore.setItemAsync('authToken', authToken);
      setToken(authToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password });
      const { token: authToken, user: userData } = response.data;
      
      await SecureStore.setItemAsync('authToken', authToken);
      setToken(authToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};