import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (ident: string, pass: string) => Promise<void>;
  register: (email: string, username: string, pass: string, fullName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('weathergpt_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('weathergpt_token');
      if (storedToken) {
        try {
          const res = await apiClient.get<User>('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('weathergpt_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (ident: string, pass: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      username_or_email: ident,
      password: pass,
    });
    localStorage.setItem('weathergpt_token', res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
  };

  const register = async (email: string, username: string, pass: string, fullName?: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      username,
      password: pass,
      full_name: fullName,
    });
    localStorage.setItem('weathergpt_token', res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('weathergpt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
