'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  remainingTime: number;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const expiresAt = localStorage.getItem('accessTokenExpiresAt');

    setIsLoggedIn(!!token);

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
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, remainingTime, setRemainingTime }}>
      {isAuthInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
