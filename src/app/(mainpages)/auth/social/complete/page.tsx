'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LinkCompletePage() {
  const sp = useSearchParams();
  const status = sp.get('status'); // 'success' | 'error'
  const reason = sp.get('reason') ?? '';
  const router = useRouter();

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => router.push('/login'), 2000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  const isSuccess = status === 'success';

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-3">
        {isSuccess ? '소셜 계정이 연동되었습니다.' : '연동에 실패했어요.'}
      </h1>

      {isSuccess ? (
        <p className="mb-4">
          이제 CareerLink 계정과 소셜 계정이 연결되었어요. 잠시 후 로그인 화면으로 이동합니다.
        </p>
      ) : (
        <div className="mb-4">
          <p className="mb-2">연동을 완료하지 못했습니다.</p>
          {reason && <p className="text-sm text-gray-600">사유: {reason}</p>}
        </div>
      )}

      <div className="flex gap-2">
        <a href="/login" className="rounded px-4 py-2 border">
          {isSuccess ? '지금 로그인하기' : '로그인 화면으로 가기'}
        </a>
        <a href="/" className="rounded px-4 py-2 border">
          홈으로
        </a>
      </div>
    </main>
  );
}
