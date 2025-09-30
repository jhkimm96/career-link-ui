'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function FindIdResult() {
  const searchParams = useSearchParams();
  const loginId = searchParams.get('loginId') ?? '';
  const router = useRouter();

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 6,
        p: 4,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        회원님의 아이디는
      </Typography>

      <Typography variant="h5" color="primary" fontWeight="bold" m={3}>
        {loginId}
      </Typography>

      <Typography variant="h5" fontWeight="bold">
        입니다.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push('/login')}
        sx={{ mt: 3, mr: 3 }}
      >
        로그인 페이지로 이동
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => router.push('/login/find/pwd')}
        sx={{ mt: 3 }}
      >
        비밀번호찾기
      </Button>
    </Box>
  );
}
