import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as api from '../services/api';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<AuthUser>(token);
        // Check if token is expired
        if (decodedToken.iat * 1000 < Date.now()) {
            setUser(decodedToken);
        } else {
            logout(); // Token is expired
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
    setLoading(false);
  }, [token, logout]);

  const login = async (credentials: any) => {
    const { token } = await api.login(credentials);
    localStorage.setItem('token', token);
    setToken(token);
    const decodedToken = jwtDecode<AuthUser>(token);
    setUser(decodedToken);
  };

  const register = async (userData: any) => {
    const { token } = await api.register(userData);
    localStorage.setItem('token', token);
    setToken(token);
    const decodedToken = jwtDecode<AuthUser>(token);
    setUser(decodedToken);
  };

  const contextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
