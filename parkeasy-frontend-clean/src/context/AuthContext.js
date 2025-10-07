import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const rawUser = localStorage.getItem('user');
      if (token && rawUser) {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (token, u) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || data.message || 'Login failed' };
      persist(data.token, { ...data.user });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || data.message || 'Registration failed' };
      persist(data.token, { ...data.user });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: !!(user?.is_admin || ['admin@parkeasy.com','administrator@parkeasy.com'].includes(user?.email))
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;