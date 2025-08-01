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
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '@/api/axios';
import { useAuth } from '@/libs/authContext';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import Image from 'next/image';
import GoogleIconButton from '@/components/googleLoginIcon';
import KakaoIconButton from '@/components/kakaoLoginIcon';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
}

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const { isLoggedIn, setIsLoggedIn, setRemainingTime } = useAuth();

  const handleSubmit = async () => {
    try {
      const res = await api.post<LoginResponse>('/api/users/login', {
        loginId,
        password,
      });

      localStorage.setItem('accessToken', res.data.accessToken);
      const expiresAt = Date.now() + res.data.accessTokenExpiresAt;
      localStorage.setItem('accessTokenExpiresAt', expiresAt.toString());

      setErrorMsg('');
      setIsLoggedIn(true);
      setRemainingTime(Math.floor(expiresAt / 1000));
      router.push('/main');
      return res.data;
      // router.refresh();
    } catch (err: any) {
      setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
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

        {errorMsg && (
          <Typography variant="body2" color="error" sx={{ marginBottom: 3 }} mt={1}>
            {errorMsg}
          </Typography>
        )}

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
          <Button size={'small'}>아이디찾기</Button>
          <Button size={'small'} href="#text-buttons">
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
    </PagesSectionLayout>
  );
};

export default LoginPage;
