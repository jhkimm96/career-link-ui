'use client';

import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

export interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor; // 'error' | 'warning' | 'info' | 'success'
  autoHideDuration?: number;
  onClose: () => void;
  bottom?: string;
}

/**
 * 공통 알림용 Snackbar 컴포넌트
 * - severity에 따라 색상 변경
 * - errorMessage, success, info 등 다양하게 사용 가능
 */
export default function NotificationSnackbar({
  open,
  message,
  severity = 'info',
  autoHideDuration = 3000,
  onClose,
  bottom = '0px',
}: NotificationSnackbarProps) {
  return (
    <Snackbar
      key={message}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        // footer 높이(64px) + 여유 8px (=72px)만큼 띄워서
        bottom: `${bottom} !important`,
        zIndex: theme => theme.zIndex.snackbar, // MUI 기본 snackbar zIndex(1400)
      }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
