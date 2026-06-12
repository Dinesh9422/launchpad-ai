import { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://127.0.0.1:8000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('access') || null);

  const register = async (data) => {
    const res = await axios.post(`${API_URL}/register/`, data);
    saveAuth(res.data);
    return res.data;
  };

  const login = async (username, password) => {
    const res = await axios.post(`${API_URL}/login/`, { username, password });
    saveAuth(res.data);
    return res.data;
  };

  const saveAuth = (data) => {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.access);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);