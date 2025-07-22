'use client';

import React from 'react';
import { Modal, Box, Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onExtend?: () => void;
}

export default function SessionModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          세션 만료 안내
        </Typography>
        <Typography variant="body2">
          로그인 세션이 곧 만료됩니다. 연장을 원하시면 연장 버튼을 눌러주세요.
        </Typography>
      </Box>
    </Modal>
  );
}
