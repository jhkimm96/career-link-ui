'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '@/api/axios';
import { jwtDecode } from 'jwt-decode';
import SessionModal from './SessionModal';
import { useAuth } from '@/libs/authContext';

interface Props {
  children: React.ReactNode;
}

interface DecodedToken {
  exp: number;
}

export default function SessionWatcher({ children }: Props) {
  const [showModal, setShowModal] = useState(false);
  const dismissedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoggedIn, setIsLoggedIn, remainingTime, setRemainingTime } = useAuth();

  // 1초마다 감소
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemainingTime(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setRemainingTime]);

  // 남은 시간 기반 처리
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkSession = async () => {
      if (remainingTime <= 2) {
        try {
          await api.post('/api/users/logout');
        } catch (error) {
          console.error('로그아웃 API 호출 실패:', error);
        } finally {
          localStorage.removeItem('accessToken');
          setIsLoggedIn(false);
          setShowModal(false);
          setRemainingTime(0);
          dismissedRef.current = false;
        }
      } else if (remainingTime <= 120) {
        if (dismissedRef.current) return;

        try {
          const token = localStorage.getItem('accessToken');
          const expiresAt = localStorage.getItem('accessTokenExpiresAt');

          if (token && expiresAt) {
            const now = Date.now();
            const remaining = Math.floor((+expiresAt - now) / 1000);
            if (remainingTime <= 120) {
              setShowModal(true);
            } else {
              setShowModal(false);
            }
          }
        } catch {
          setShowModal(false);
        }
      } else {
        setShowModal(false);
      }
    };

    checkSession().catch(err => console.error('checkSession 실패:', err));
  }, [remainingTime, isLoggedIn, setIsLoggedIn]);

  return (
    <>
      {children}
      <SessionModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          dismissedRef.current = true;
        }}
      />
    </>
  );
}
