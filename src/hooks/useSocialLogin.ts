'use client';

import { useState } from 'react';

function join(base: string | undefined, path: string) {
  if (!base) throw new Error('NEXT_PUBLIC_API_BASE_URL is missing');
  return new URL(path, base).toString();
}

export function useSocialLogin() {
  const [loading, setLoading] = useState(false);

  const redirectTo = (path: string) => {
    window.location.assign(join(process.env.NEXT_PUBLIC_API_BASE_URL, path));
  };

  const loginWithGoogle = () => {
    redirectTo('/oauth2/authorization/google');
  };

  const loginWithKakao = () => {
    redirectTo('/oauth2/authorization/kakao');
  };

  const resendLink = async (email: string) => {
    setLoading(true);
    try {
      await fetch(join(process.env.NEXT_PUBLIC_API_BASE_URL, '/api/auth/link/resend'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      alert(`${email}로 연결 확인 메일을 재전송했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  return { loginWithGoogle, loginWithKakao, resendLink, loading };
}
