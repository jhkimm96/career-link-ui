'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import NotificationSnackbar from '@/components/snackBar';

export default function Page() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const handleShowError = () => {
    // 백엔드 에러 메시지를 가져왔다고 가정
    const errorMessage = '서버 오류가 발생했습니다. 다시 시도해주세요.';
    setSnackbar({ open: true, message: errorMessage, severity: 'error' });
  };
  const handleShowSuccess = () => {
    setSnackbar({ open: true, message: '저장되었습니다.', severity: 'success' });
  };
  const handleClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  const handleShowInfo = () => {
    setSnackbar({ open: true, message: '안내 메시지입니다.', severity: 'info' });
  };
  return (
    <Box sx={{ pb: { xs: 18, sm: 14 }, minHeight: '40vh' }}>
      <Typography variant="h6" gutterBottom>
        스낵바알림 샘플
      </Typography>
      <Box
        sx={{
          pb: { xs: 18, sm: 14 },
          minHeight: '40vh',
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          🌟 스낵바 알림 데모
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          아래 버튼을 눌러 각 상황에 맞는 알림을 확인해보세요.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • 에러: 서버 오류 등 에러메세지 <br />
          • 성공: 저장, 업데이트 완료 등 <br />• 정보: 간단한 주의사항, 가이드 안내 등
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleShowError}>
            에러 메시지
          </Button>
          <Button variant="outlined" onClick={handleShowSuccess}>
            성공 메시지
          </Button>
          <Button variant="outlined" onClick={handleShowInfo}>
            정보 메시지
          </Button>
        </Stack>
      </Box>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
      />
    </Box>
  );
}
