'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Divider,
  type AlertColor,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '@/api/axios';
import { useAuth } from '@/libs/authContext';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import Image from 'next/image';
import GoogleIconButton from '@/components/googleLoginIcon';
import KakaoIconButton from '@/components/kakaoLoginIcon';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
}

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const router = useRouter();

  const { isLoggedIn, setIsLoggedIn, setRemainingTime } = useAuth();

  const handleClose = () => {
    closeSnackbar(setSnackbar);
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post<LoginResponse>('/api/users/login', {
        loginId,
        password,
      });

      localStorage.setItem('accessToken', res.data.accessToken);
      const expiresAt = Date.now() + res.data.accessTokenExpiresAt;
      localStorage.setItem('accessTokenExpiresAt', expiresAt.toString());

      setIsLoggedIn(true);
      setRemainingTime(Math.floor(expiresAt / 1000));
      notifySuccess(setSnackbar, '로그인되었습니다.');
      router.push('/main');
      return res.data;
      // router.refresh();
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <PagesSectionLayout>
      <Box
        // component="form"
        sx={{
          p: 15,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          rowGap: 2,
        }}
      >
        <TextField
          label="아이디"
          value={loginId}
          fullWidth
          sx={{ marginBottom: 2 }}
          onChange={e => setLoginId(e.target.value)}
        />

        <TextField
          label="비밀번호"
          type={showPassword ? 'text' : 'password'}
          value={password}
          fullWidth
          sx={{ marginBottom: 1 }}
          onChange={e => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box display="flex" gap={2} marginBottom={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ flex: 1 }}
            onClick={handleSubmit}
          >
            로그인
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ flex: 1 }}
            onClick={() => {
              router.push('/signup');
            }}
          >
            회원가입
          </Button>
        </Box>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size={'small'} onClick={() => router.push('/login/find/id')}>
            아이디찾기
          </Button>
          <Button size={'small'} onClick={() => router.push('/login/find/pwd')}>
            비밀번호찾기
          </Button>
        </Stack>
        <Divider>
          <Typography variant="body2" color="text.secondary">
            간편로그인
          </Typography>
        </Divider>
        <Box display="flex" justifyContent="center" mt={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <KakaoIconButton />
            <GoogleIconButton />
          </Stack>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" flex={1} p={2}>
        <Image src="/cardImg.png" alt="logo" width={400} height={200} />
      </Box>
      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
      />
    </PagesSectionLayout>
  );
};

export default LoginPage;
