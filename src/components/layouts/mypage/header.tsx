'use client';

import { AppBar, Toolbar, Box, IconButton } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Header() {
  const router = useRouter();

  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="large">
            <NotificationsNoneIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="large"
            onClick={() => {
              router.push('/mypage');
            }}
          >
            <AccountCircle fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
