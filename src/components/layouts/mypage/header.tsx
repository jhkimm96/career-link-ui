'use client';

import { AppBar, Toolbar, Box } from '@mui/material';
import React from 'react';
import AppHeaderIconIsLogined from '@/components/layouts/header/appHeaderIconIsLogined';

export default function Header() {
  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AppHeaderIconIsLogined />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
