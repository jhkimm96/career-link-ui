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
      if (remainingTime <= 0) {
        try {
          await api.post('/api/users/logout');
        } catch (error) {
          console.error('로그아웃 API 호출 실패:', error);
        } finally {
          localStorage.removeItem('accessToken');
          setIsLoggedIn(false);
          setShowModal(false);
          setRemainingTime(0);
        }
      } else if (remainingTime <= 120) {
        try {
          const token = localStorage.getItem('accessToken');
          if (token) {
            const decoded = jwtDecode<DecodedToken>(token);
            const now = Date.now();
            const exp = decoded.exp * 1000;
            if (exp - now <= 120000) {
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
