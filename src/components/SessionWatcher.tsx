'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '@/api/axios';
import SessionModal from './SessionModal';
import { useAuth } from '@/libs/authContext';

interface Props {
  children: React.ReactNode;
}

export default function SessionWatcher({ children }: Props) {
  const [showModal, setShowModal] = useState(false);
  const dismissedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoggedIn, setIsLoggedIn, remainingTime, setRemainingTime } = useAuth();

  // 1초마다 남은 시간을 절대시각 기준으로 재계산
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const expiresAt = localStorage.getItem('accessTokenExpiresAt');
      if (!expiresAt) {
        setRemainingTime(0);
        return;
      }

      const now = Date.now();
      const remaining = Math.floor((+expiresAt - now) / 1000);
      setRemainingTime(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setRemainingTime]);

  // 남은 시간 상태에 따른 세션 처리
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkSession = async () => {
      if (remainingTime <= 0) {
        try {
          await api.post('/users/logout');
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

        setShowModal(true);
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
