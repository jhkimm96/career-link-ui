'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    }
  }, []);

  return <div>마이페이지에 오신 것을 환영합니다!</div>;
}
