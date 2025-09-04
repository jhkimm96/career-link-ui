'use client';

import { Box, Tabs, Typography, Container, Tab } from '@mui/material';
import { useAuth } from '@/libs/authContext';

export default function MyPage() {
  const { userType } = useAuth(); // ✅ userType 받아오기

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={3}>
            {userType ? userType.toUpperCase() : 'LOADING...'}
          </Typography>

          <Tabs value={0} textColor="primary" indicatorColor="primary">
            <Tab label="일자별/월별/년도별 접속자 수" />
            <Tab label="일자별/월별/년도별 등록 공고 수" />
            <Tab label="일자별/월별/년도별 합격자 수" />
            <Tab label="성별/연령/지역별 합격자수" />
          </Tabs>

          <Typography mt={4}>마이페이지에 오신 것을 환영합니다!</Typography>
        </Container>
      </Box>
    </Box>
  );
}
