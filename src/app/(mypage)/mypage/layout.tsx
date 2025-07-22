'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Sidebar from '@/components/layouts/mypage/sidebar';
import Header from '@/components/layouts/mypage/header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MypageLayout({ children }: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box component="main" sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
