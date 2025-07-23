'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '@/api/axios';
import { useAuth } from '@/libs/authContext';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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

      setErrorMsg('');
      setIsLoggedIn(true);
      setRemainingTime(15 * 60);
      router.push('/main');
    } catch (err: any) {
      setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          로그인
        </Typography>

        <TextField
          label="아이디"
          fullWidth
          margin="normal"
          value={loginId}
          onChange={e => setLoginId(e.target.value)}
        />

        <TextField
          label="비밀번호"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          value={password}
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
          <Typography variant="body2" color="error" mt={1}>
            {errorMsg}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 3 }}
          onClick={handleSubmit}
        >
          로그인
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
