'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type AlertColor,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
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
  accessTokenExpiresAt: number;
  role: string;
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

  const { signIn } = useAuth();

  const handleClose = () => {
    closeSnackbar(setSnackbar);
  };

  const handleSubmit = async () => {
    try {
      await api.post<LoginResponse>('/api/users/login', {
        loginId,
        password,
      });

      await signIn(); // 쿠키 기반 로그인 반영
      notifySuccess(setSnackbar, '로그인되었습니다.');
      router.push('/main');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
      if (err.code === 'ACCOUNT_DORMANT') {
        const next = '/main';
        router.push(
          `/reactivate?loginId=${encodeURIComponent(loginId)}&next=${encodeURIComponent(next)}`
        );
        return;
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          px: { xs: 2, sm: 4, md: 6, lg: 10 },
          py: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', md: '1400px' },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'stretch' },
            justifyContent: 'flex-start',
            columnGap: { md: 10, lg: 12 },
            rowGap: { xs: 4, md: 0 },
          }}
        >
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: { xs: 3, sm: 4 },
              width: '100%',
              maxWidth: { xs: '100%', sm: 400, md: 480 },
              flexShrink: 0,
              mr: { xs: 0, md: 2 },
              height: { xs: 'auto', md: '100%' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { xs: 'flex-start', md: 'center' },
              }}
            >
              <TextField
                label="아이디"
                value={loginId}
                fullWidth
                sx={{ mb: 2 }}
                onChange={e => setLoginId(e.target.value)}
              />

              <TextField
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                value={password}
                fullWidth
                sx={{ mb: 2 }}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ flex: 1, minWidth: 120 }}
                  onClick={handleSubmit}
                >
                  로그인
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{ flex: 1, minWidth: 120 }}
                  onClick={() => {
                    router.push('/signup');
                  }}
                >
                  회원가입
                </Button>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                justifyContent="flex-end"
                sx={{
                  flexWrap: 'wrap',
                  rowGap: 1,
                  mb: 2,
                  typography: 'caption',
                  textAlign: 'right',
                }}
              >
                <Button
                  size="small"
                  sx={{ minWidth: 'auto', p: 0 }}
                  onClick={() => router.push('/login/find/id')}
                >
                  아이디찾기
                </Button>
                <Typography variant="caption" color="text.disabled">
                  |
                </Typography>
                <Button
                  size="small"
                  sx={{ minWidth: 'auto', p: 0 }}
                  onClick={() => router.push('/login/find/pwd')}
                >
                  비밀번호찾기
                </Button>
              </Stack>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  간편로그인
                </Typography>
              </Divider>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                {/* <KakaoIconButton /> */}
                <GoogleIconButton />
              </Stack>
            </Box>
          </Box>

          {/* 이미지 (모바일에서는 안 보임) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              flexGrow: 1,
              maxWidth: 480,
              height: { xs: 'auto', md: '100%' },
            }}
          >
            <Image
              src="/cardImg_new.png"
              alt="logo"
              width={480}
              height={640}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 스낵바 */}
      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
      />
    </>
  );
};

export default LoginPage;
