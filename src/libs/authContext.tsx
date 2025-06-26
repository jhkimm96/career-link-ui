'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '@/api/axios';

type AuthMe = {
  role: string | null;
  employerId: string | null;
  accessTokenExpiresAt: number | null;
};

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  remainingTime: number;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
  role: string | null;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  employerId: string | null;
  setEmployerId: React.Dispatch<React.SetStateAction<string | null>>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const expiresAtRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (accessTokenExpiresAt: number | null) => {
    clearTimer();
    if (!accessTokenExpiresAt) {
      setRemainingTime(0);
      return;
    }

    const initial = Math.max(0, Math.floor((accessTokenExpiresAt - Date.now()) / 1000));
    setRemainingTime(initial);
    timerRef.current = setInterval(() => {
      const remain = Math.max(0, Math.floor((accessTokenExpiresAt - Date.now()) / 1000));
      setRemainingTime(remain);
      if (remain === 0) {
        clearTimer();
      }
    }, 1000);
  };

  const fetchMe = async () => {
    try {
      const res = await api.get<AuthMe>('/api/users/auth/me');
      const { role, employerId, accessTokenExpiresAt } = res.data;
      setRole(role);
      setEmployerId(employerId);
      setIsLoggedIn(!!role); // role 존재하면 로그인된 것으로 판단
      expiresAtRef.current = accessTokenExpiresAt ?? null;
      startTimer(expiresAtRef.current);
    } catch {
      setRole(null);
      setEmployerId(null);
      setIsLoggedIn(false);
      expiresAtRef.current = null;
      startTimer(null);
    }
  };

  // 초기 구동 시 me로 세션 확인
  useEffect(() => {
    (async () => {
      await fetchMe();
      setIsAuthInitialized(true);
    })();
    return clearTimer;
  }, []);

  // 로그인 직후 호출: 서버가 Set-Cookie로 쿠키 저장했으니 me 다시 조회
  const signIn = async () => {
    await fetchMe();
  };

  const signOut = async () => {
    try {
      await api.post('/api/users/logout');
    } catch {}
    setRole(null);
    setEmployerId(null);
    setIsLoggedIn(false);
    expiresAtRef.current = null;
    startTimer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        remainingTime,
        setRemainingTime,
        role,
        setRole,
        employerId,
        setEmployerId,
        signIn,
        signOut,
      }}
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
