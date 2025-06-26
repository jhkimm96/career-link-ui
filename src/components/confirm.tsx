'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type Intent = 'info' | 'warning' | 'error' | 'success';

export type ConfirmOptions = {
  title?: React.ReactNode;
  message?: React.ReactNode; // 문자열이면 \n 로 줄바꿈 가능
  confirmText?: string; // 기본: '확인'
  cancelText?: string; // 기본: '취소'
  intent?: Intent; // 기본: 'warning'
  destructive?: boolean; // confirm 버튼을 error 색으로
  hideCancel?: boolean; // 단일 확인용
  maxWidth?: 'xs' | 'sm' | 'md'; // 기본: 'xs'
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<
    { open: boolean; resolve?: (v: boolean) => void } & ConfirmOptions
  >({ open: false });

  const confirm = useCallback<ConfirmFn>(opts => {
    return new Promise<boolean>(resolve => {
      setState({ open: true, ...opts, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState({ open: false });
  };

  const intent = state.intent ?? 'warning';
  const Icon = {
    info: InfoOutlinedIcon,
    warning: WarningAmberRoundedIcon,
    error: ErrorOutlineRoundedIcon,
    success: CheckCircleRoundedIcon,
  }[intent];

  const color = {
    info: 'info.main',
    warning: 'warning.main',
    error: 'error.main',
    success: 'success.main',
  }[intent];

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={state.open}
        onClose={() => handleClose(false)}
        fullWidth
        maxWidth={state.maxWidth ?? 'xs'}
        aria-labelledby="confirm-title"
      >
        <Stack alignItems="center" spacing={2} sx={{ pt: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color,
              border: t => `2px solid ${t.palette.divider}`,
              bgcolor: t => t.palette.background.default,
            }}
          >
            <Icon fontSize="large" />
          </Box>

          <DialogTitle id="confirm-title" sx={{ p: 0, textAlign: 'center' }}>
            {state.title}
          </DialogTitle>

          {state.message && (
            <DialogContent sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ textAlign: 'center', whiteSpace: 'pre-line' }}>
                {state.message}
              </Typography>
            </DialogContent>
          )}
        </Stack>

        <DialogActions sx={{ p: 2, pt: 3, justifyContent: 'center', gap: 1.5 }}>
          {!state.hideCancel && (
            <Button variant="outlined" onClick={() => handleClose(false)}>
              {state.cancelText ?? '취소'}
            </Button>
          )}
          <Button
            variant="contained"
            color={
              state.destructive || intent === 'error'
                ? 'error'
                : intent === 'success'
                  ? 'success'
                  : 'primary'
            }
            onClick={() => handleClose(true)}
            autoFocus
          >
            {state.confirmText ?? '확인'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
