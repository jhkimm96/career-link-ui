'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SidebarItem from '@/components/layouts/mypage/sidebarItem';
import { menus, UserType } from '@/components/layouts/mypage/sidebarMenus';
import { Box, IconButton, List, Tabs, Typography, Container, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log(token);
    if (!token) {
      router.push('/login');
    }
  }, []);
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => {
    setOpen(prev => !prev);
  };

  const userType: UserType = 'applicant';

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={3}>
            {userType}
          </Typography>
          <Tabs value={0} textColor="primary" indicatorColor="primary">
            <Tab label="홈" />
            <Tab label="지원 현황" />
            <Tab label="받은 제안" />
            <Tab label="스크랩" />
          </Tabs>
          <Typography mt={4}>마이페이지에 오신 것을 환영합니다!</Typography>
        </Container>
      </Box>
    </Box>
  );
}
