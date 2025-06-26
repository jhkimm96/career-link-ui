'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';

export default function MyPage() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    if (role === 'ADMIN') {
      router.replace('/mypage/admin/home');
    } else if (role === 'EMP') {
      router.replace('/mypage/emp/home');
    } else if (role === 'USER') {
      router.replace('/mypage/applicant/account');
    } else {
      router.replace('/main');
    }
  }, [role, router]);

  return null;
}
