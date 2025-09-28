'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, Button, Stack } from '@mui/material';

export default function OAuthErrorPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const status = sp.get('status');
  const email = sp.get('email');
  const existingProvider = sp.get('existingProvider');

  if (status === 'ALREADY_LINKED') {
    return (
      <Stack spacing={2} sx={{ p: 3, maxWidth: 520, mx: 'auto' }}>
        <Alert severity="error">
          이미 {existingProvider} 계정으로 연결된 이메일입니다: {email}.<br />
          현재 로그인 방식으로는 이용이 불가합니다.
        </Alert>
        <Button variant="contained" onClick={() => router.replace('/login')}>
          로그인 페이지로
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 520, mx: 'auto' }}>
      <Alert severity="error">인증 중 오류가 발생했습니다.</Alert>
      <Button variant="contained" onClick={() => router.replace('/login')}>
        로그인 페이지로
      </Button>
    </Stack>
  );
}
