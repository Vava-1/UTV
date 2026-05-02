import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import api from '@/utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('utv_token');
    const savedUser = localStorage.getItem('utv_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        api.get('/auth/me').then(res => {
          setUser(res.data);
          localStorage.setItem('utv_user', JSON.stringify(res.data));
        }).catch(() => logout());
      } catch { logout(); }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('utv_token', res.data.access_token);
    localStorage.setItem('utv_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { email, password, first_name: firstName, last_name: lastName });
    localStorage.setItem('utv_token', res.data.access_token);
    localStorage.setItem('utv_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('utv_token');
    localStorage.removeItem('utv_user');
    setUser(null);
    window.location.href = '/';
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem('utv_user', JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin', isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
