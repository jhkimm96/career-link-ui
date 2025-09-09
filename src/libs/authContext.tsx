'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = { role?: string; exp?: number; employerId?: string; [k: string]: any };

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  remainingTime: number;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
  role: string | null;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  employerId: string | null;
  setEmployerId: React.Dispatch<React.SetStateAction<string | null>>;
  signIn: (accessToken: string, ttlMs: number) => void;
  signOut?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const parseClaims = (token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const r = decoded.role ? String(decoded.role) : null;
      const emp = decoded.employerId != null ? String(decoded.employerId) : null;
      const exp = decoded.exp ? Number(decoded.exp) : null;
      return { role: r, employerId: emp, exp };
    } catch {
      return { role: null, employerId: null, exp: null };
    }
  };

  const signIn = (accessToken: string, ttlMs: number) => {
    const expiresAtMs = Date.now() + ttlMs;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('accessTokenExpiresAt', String(expiresAtMs));

    const { role: r, employerId: emp } = parseClaims(accessToken);
    setIsLoggedIn(true);
    setRole(r);
    setEmployerId(emp);
    const remainSec = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
    setRemainingTime(remainSec);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const expiresAt = localStorage.getItem('accessTokenExpiresAt');

    if (token) {
      const { role: r, employerId: emp } = parseClaims(token);
      setRole(r);
      setEmployerId(emp);
      setIsLoggedIn(true);
    } else {
      setRole(null);
      setEmployerId(null);
      setIsLoggedIn(false);
    }

    if (token && expiresAt) {
      const remainSec = Math.max(0, Math.floor((+expiresAt - Date.now()) / 1000));
      setRemainingTime(remainSec);
    } else {
      setRemainingTime(0);
    }

    setIsAuthInitialized(true);
  }, []);

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
