'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '@/api/axios';
import SessionModal from './SessionModal';
import { useAuth } from '@/libs/authContext';
import { useRouter } from 'next/navigation';

type Props = { children: React.ReactNode };

export default function SessionWatcher({ children }: Props) {
  const { isLoggedIn, remainingTime, setIsLoggedIn, setRemainingTime, signIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const actingRef = useRef(false);
  const dismissedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(false);
      actingRef.current = false;
      dismissedRef.current = false;
      return;
    }

    if (remainingTime <= 0) {
      if (actingRef.current) return;
      actingRef.current = true;

      (async () => {
        try {
          await api.post('/api/users/logout'); // 쿠키 만료
        } catch {}
        setIsLoggedIn(false);
        setRemainingTime(0);
        setShowModal(false);
        dismissedRef.current = false;
        router.push('/main');
        actingRef.current = false;
      })();

      return;
    }

    if (remainingTime <= 120) {
      if (!dismissedRef.current) setShowModal(true);
    } else {
      setShowModal(false);
      dismissedRef.current = false;
    }
  }, [isLoggedIn, remainingTime, setIsLoggedIn, setRemainingTime, signIn, router]);

  const handleExtend = async () => {
    try {
      await api.post('/api/users/reissue');
      await signIn();
      setShowModal(false);
      dismissedRef.current = false;
    } catch {}
  };

  return (
    <>
      {children}
      <SessionModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          dismissedRef.current = true;
        }}
        onExtend={handleExtend}
      />
    </>
  );
}
