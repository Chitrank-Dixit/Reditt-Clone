import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as api from '../services/api';
import type { AuthUser, ProfileUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isMemberOf: (subredditId: string) => boolean;
  fetchUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setUserProfile(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (user) {
      try {
        const profile = await api.getUserByUsername(user.name);
        setUserProfile(profile);
      } catch (e) {
        console.error('Failed to fetch user profile, logging out.', e);
        logout();
      }
    }
  }, [user, logout]);


  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<AuthUser>(token);
        // FIX: Check if token is expired using 'exp' field instead of 'iat'
        if (decodedToken.exp * 1000 > Date.now()) {
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
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user, fetchUserProfile]);


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

  const isMemberOf = useCallback((subredditId: string) => {
    return !!userProfile?.joinedSubreddits?.includes(subredditId);
  }, [userProfile]);

  const contextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isMemberOf,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
