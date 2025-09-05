'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = { role?: string; exp?: number; [k: string]: any };

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  remainingTime: number;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
  role: string | null;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // 토큰에서 role 정보 가져오기
  const extractRole = (token: string | null) => {
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const raw = (decoded.role ?? '').toString();
      return raw || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const expiresAt = localStorage.getItem('accessTokenExpiresAt');

    setIsLoggedIn(!!token);
    setRole(extractRole(token));

    if (token && expiresAt) {
      try {
        const now = Date.now();
        const remaining = Math.floor((+expiresAt - now) / 1000);
        setRemainingTime(remaining > 0 ? remaining : 0);
        console.log('토큰 유효시간 remaining :: ' + remaining);
      } catch {
        setRemainingTime(0);
      }
    }

    setIsAuthInitialized(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, remainingTime, setRemainingTime, role, setRole }}
    >
      {isAuthInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
