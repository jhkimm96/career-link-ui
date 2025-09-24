'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Box, Button, TextField, Typography, Stack } from '@mui/material';
import api from '@/api/axios';
import { notifyError, notifySuccess } from '@/api/apiNotify';

export default function ReactivatePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const loginIdInit = sp.get('loginId') ?? '';

  const [loginId, setLoginId] = useState(loginIdInit);
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    try {
      setLoading(true);
      await api.post('/users/reactivate/request', { loginId });
      setSent(true);
      notifySuccess(() => {}, '회원정보로 등록된 이메일로 인증코드를 전송했습니다.');
    } catch (e: any) {
      notifyError(() => {}, e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      await api.post('/users/reactivate/verify', { loginId, code }); // 휴면 해제
      notifySuccess(() => {}, '휴면 해제가 완료되었습니다. 다시 로그인해주세요.');
      router.push('/login');
    } catch (e: any) {
      notifyError(() => {}, e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={420} mx="auto" mt={8}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        휴면계정 해제
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        본인확인 후 휴면을 해제할 수 있습니다.
      </Typography>
      <Stack spacing={2}>
        <TextField label="아이디" value={loginId} onChange={e => setLoginId(e.target.value)} />
        {sent ? (
          <>
            <TextField label="인증코드" value={code} onChange={e => setCode(e.target.value)} />
            <Button disabled={loading || !code} variant="contained" onClick={verifyOtp}>
              휴면 해제
            </Button>
          </>
        ) : (
          <Button disabled={loading || !loginId} variant="contained" onClick={sendOtp}>
            인증코드 받기
          </Button>
        )}
        <Button variant="text" onClick={() => router.push('/login')}>
          로그인으로 돌아가기
        </Button>
      </Stack>
    </Box>
  );
}
