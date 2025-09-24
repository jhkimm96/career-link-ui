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
  resetToken: string;
}

export default function FindPwdForm() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
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
      const res = await api.post<SendVerificationCodeResponse>('/users/send-pwd-code', {
        userName,
        email,
        loginId,
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

  const handleFindPwd = async () => {
    try {
      const res = await api.post<FindIdResponse>('/users/verify-pwd-code', {
        userName,
        email,
        loginId,
        code,
      });
      notifySuccess(setSnackbar, '인증번호가 확인되었습니다.');
      const resetToken = res.data.resetToken;
      sessionStorage.setItem('resetToken', resetToken);
      router.push('/login/find/pwd/reset-password');
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
        비밀번호 찾기
      </Typography>

      <Typography variant="subtitle1" gutterBottom color="text.secondary" mb={3}>
        회원정보에 등록된 이메일로 비밀번호 찾기
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

        <TextField
          label="아이디"
          name="loginId"
          value={loginId}
          variant="outlined"
          fullWidth
          required
          size="medium"
          onChange={e => setLoginId(e.target.value)}
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

      <Button variant="contained" color="primary" size="large" fullWidth onClick={handleFindPwd}>
        비밀번호 재설정
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
