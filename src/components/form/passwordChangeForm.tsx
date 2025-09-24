'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Stack } from '@mui/material';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import type { AlertColor } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';

interface PasswordChangeFormProps {
  url: string;
  onCancel: () => void;
}

export default function PasswordChangeForm({ url, onCancel }: PasswordChangeFormProps) {
  const { setIsLoggedIn, setRemainingTime } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const handleClose = () => closeSnackbar(setSnackbar);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      notifyError(setSnackbar, '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await api.post(url, {
        currentPassword,
        newPassword,
      });
      notifySuccess(setSnackbar, '비밀번호가 성공적으로 변경되었습니다.');
      await api.post('/users/logout');
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      setRemainingTime(0);
      router.push('/main');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        비밀번호 변경
      </Typography>

      <Stack spacing={2} mb={2}>
        <TextField
          label="현재 비밀번호"
          type="password"
          fullWidth
          size="small"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />
        <TextField
          label="새 비밀번호"
          type="password"
          fullWidth
          size="small"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <TextField
          label="새 비밀번호 확인"
          type="password"
          fullWidth
          size="small"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </Stack>

      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Button variant="outlined" onClick={onCancel}>
          이전
        </Button>
        <Button variant="contained" color="primary" onClick={handleChangePassword}>
          변경하기
        </Button>
      </Stack>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
      />
    </Box>
  );
}
