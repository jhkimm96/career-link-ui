'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Alert, AlertColor } from '@mui/material';
import api from '@/api/axios';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('resetToken');
    if (!token) {
      setError('유효하지 않은 접근입니다.');
    } else {
      setResetToken(token);
    }
  }, []);

  const handleClose = () => {
    closeSnackbar(setSnackbar);
  };

  const handleSubmit = async () => {
    if (!resetToken) {
      notifyError(setSnackbar, '비밀번호 재설정을 위한 인증번호 입력을 다시 진행해주세요.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      notifyError(setSnackbar, '모든 필드를 입력하세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notifyError(setSnackbar, '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await api.post('/api/users/reset-password', {
        resetToken,
        newPassword,
      });
      // 토큰 사용 후 삭제
      sessionStorage.removeItem('resetToken');

      notifySuccess(setSnackbar, '비밀번호가 변경되었습니다. 로그인 해주세요.');
      router.push('/login');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
        비밀번호 재설정
      </Typography>
      <TextField
        fullWidth
        label="새 비밀번호"
        type="password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="비밀번호 확인"
        type="password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        margin="normal"
      />
      <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
        비밀번호 변경
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
