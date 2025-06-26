'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, TextField, Button, Stack, type AlertColor } from '@mui/material';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';

interface ResponseHeader {
  result: boolean;
  message: string;
}

interface ResponseResult<T> {
  header: ResponseHeader;
  body: T | null;
  pagination?: any;
}

type SendVerificationCodeResponse = ResponseResult<null>;

interface FindIdResponse {
  loginId: string;
}

export default function FindIdForm() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleClose = () => {
    closeSnackbar(setSnackbar);
  };

  const handleSendVerifyCode = async () => {
    if (cooldown > 0) return;

    try {
      const res = await api.post<SendVerificationCodeResponse>('/api/users/send-id-code', {
        userName,
        email,
      });
      notifySuccess(setSnackbar, '인증번호가 발송되었습니다.');
      setCooldown(60);
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  useEffect(() => {
    if (cooldown === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (cooldown > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cooldown]);

  const handleFindId = async () => {
    try {
      const res = await api.post<FindIdResponse>('/api/users/verify-id-code', {
        userName,
        email,
        code,
      });
      notifySuccess(setSnackbar, '인증번호가 확인되었습니다.');
      router.push('/login/find/id/result?loginId=' + encodeURIComponent(res.data.loginId));
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <Box
      sx={{
        pb: { xs: 18, sm: 14 },
        minHeight: '40vh',
        maxWidth: 400,
        mx: 'auto',
        mt: 6,
        px: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        아이디 찾기
      </Typography>

      <Typography variant="subtitle1" gutterBottom color="text.secondary" mb={3}>
        회원정보에 등록된 이메일로 아이디 찾기
      </Typography>

      <Stack spacing={3} mb={3}>
        <TextField
          label="이름"
          name="userName"
          value={userName}
          variant="outlined"
          fullWidth
          required
          size="medium"
          onChange={e => setUserName(e.target.value)}
        />
        <TextField
          label="이메일"
          name="email"
          value={email}
          variant="outlined"
          fullWidth
          required
          size="medium"
          type="email"
          onChange={e => setEmail(e.target.value)}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="인증번호"
            name="verifyCode"
            value={code}
            variant="outlined"
            size="medium"
            fullWidth
            required
            type="text"
            onChange={e => setCode(e.target.value)}
          />
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleSendVerifyCode}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `${cooldown}초 후 재전송` : '인증번호 받기'}
          </Button>
        </Stack>
      </Stack>

      {/* 최종 아이디 찾기 버튼 */}
      <Button variant="contained" color="primary" size="large" fullWidth onClick={handleFindId}>
        아이디 찾기
      </Button>
      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
        bottom="20px"
      />
    </Box>
  );
}
