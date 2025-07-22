'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Sidebar from '@/components/layouts/mypage/sidebar';
import Header from '@/components/layouts/mypage/header';
import Footer from '@/components/layouts/footer';

interface MypageLayoutProps {
  children: ReactNode;
}

export default function MypageLayout({ children }: MypageLayoutProps) {
  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Box component="main" sx={{ p: 3 }}>
            {children}
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
