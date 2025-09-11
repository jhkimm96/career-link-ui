'use client';

import { Tabs, Typography, Container, Tab } from '@mui/material';

export default function MyPage() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight={700} mb={3}>
        지원자
      </Typography>
      <Tabs value={0} textColor="primary" indicatorColor="primary">
        <Tab label="프로필" />
        <Tab label="TOP10 공고 목록" />
      </Tabs>

      <Typography mt={4}>마이페이지에 오신 것을 환영합니다!</Typography>
    </Container>
  );
}
