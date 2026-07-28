import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(getRoleFromToken(localStorage.getItem('token')));

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    setToken(token);
    setRole(getRoleFromToken(token));
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAuthenticated: !!token, isAdmin: role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
