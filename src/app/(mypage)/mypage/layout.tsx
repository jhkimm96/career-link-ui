'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import Sidebar from '@/components/layouts/mypage/sidebar';
import Header from '@/components/layouts/mypage/header';
import Footer from '@/components/layouts/footer';

interface MypageLayoutProps {
  children: ReactNode;
}

export default function MypageLayout({ children }: MypageLayoutProps) {
  const pathname = usePathname();

  // "/mypage" 진입 시에는 레이아웃을 렌더링하지 않음
  const isRedirectPage = pathname === '/mypage';

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {!isRedirectPage && <Sidebar />}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {!isRedirectPage && <Header />}
          <Box component="main">{children}</Box>
        </Box>
      </Box>
      {!isRedirectPage && <Footer />}
    </>
  );
}
