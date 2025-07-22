'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Divider,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '@/libs/authContext';

const navItems = [
  { label: 'Home', href: '/', submenu: ['Submenu 1', 'Submenu 2'] },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

interface ReissueResponse {
  accessToken: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { isLoggedIn, setIsLoggedIn, remainingTime, setRemainingTime } = useAuth();
  const router = useRouter();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, label: string) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(openMenu === label ? null : label);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(null);
  };

  const handleExtendSession = async () => {
    try {
      const response = await api.post<ReissueResponse>('/api/users/reissue', {});
      const newAccessToken = response.data.accessToken;

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        setRemainingTime(15 * 60);
        setIsLoggedIn(true);
      } else {
        throw new Error('AccessToken 없음');
      }
    } catch (error) {
      console.error('세션 연장 실패:', error);
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/users/logout');
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      setRemainingTime(0);
      router.push('/main');
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, md: 6 },
            py: 1.5,
            borderBottom: '1px solid #eee',
          }}
        >
          {/* Logo + Nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Link href="/">
              <Image src="/c-logo.png" alt="logo" width={60} height={60} />
            </Link>

            <Box sx={{ display: 'flex', gap: 4 }}>
              {navItems.map(({ label, submenu, href }) => (
                <Box
                  key={label}
                  onClick={e => submenu && handleMenuClick(e, label)}
                  sx={{
                    position: 'relative',
                    fontWeight: openMenu === label ? 600 : 400,
                    borderBottom:
                      openMenu === label ? '2px solid #1976d2' : '2px solid transparent',
                    cursor: submenu ? 'pointer' : 'default',
                  }}
                >
                  {submenu ? (
                    <Typography variant="body2">{label}</Typography>
                  ) : (
                    <Link href={href || '#'}>
                      <Typography variant="body2" sx={{ color: 'inherit', textDecoration: 'none' }}>
                        {label}
                      </Typography>
                    </Link>
                  )}

                  {openMenu === label && submenu && (
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1.5,
                            borderRadius: 2,
                            boxShadow: 2,
                            minWidth: 160,
                            border: '1px solid #eee',
                          },
                        },
                      }}
                    >
                      {submenu.map((item, i) => (
                        <MenuItem key={i} onClick={handleClose} sx={{ fontSize: 14 }}>
                          {item}
                        </MenuItem>
                      ))}
                    </Menu>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/*Icons */}
          <Box display="flex" alignItems="center" gap={2}>
            {isLoggedIn ? (
              <>
                <IconButton size="large">
                  <MailOutlineIcon fontSize="small" />
                </IconButton>
                <IconButton size="large">
                  <NotificationsNoneIcon fontSize="small" />
                </IconButton>
                <IconButton size="large" onClick={e => handleMenuClick(e, 'logout')}>
                  <AccountCircle fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu === 'logout'}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      router.push('/mypage'); // 마이페이지로 이동
                    }}
                  >
                    마이페이지
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleClose();
                      handleLogout(); // 로그아웃 처리
                    }}
                  >
                    로그아웃
                  </MenuItem>
                </Menu>
                <Paper
                  elevation={4}
                  sx={{
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: '10px' }}>⏰ 남은 시간:</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '10px' }}>
                    {formatTime(remainingTime)}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      ml: 1,
                      fontSize: '10px',
                      borderColor: 'white',
                      color: 'white',
                      minWidth: 'auto',
                      px: 0.8,
                      py: 0.3,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                    onClick={handleExtendSession} // 🔁 여기에 연장 핸들러 함수 연결
                  >
                    연장
                  </Button>
                </Paper>
              </>
            ) : (
              <>
                <Stack direction="row">
                  <Link href="/login" passHref>
                    <Button variant="text" size="small">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup" passHref>
                    <Button variant="text" size="small">
                      회원가입
                    </Button>
                  </Link>
                  <Link href="/emp" passHref>
                    <IconButton size="large">
                      <BusinessRoundedIcon fontSize="small" />
                    </IconButton>
                  </Link>
                </Stack>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        {children}
      </Container>

      {/* Footer */}
      <Divider />
      <Box component="footer" sx={{ py: 2, textAlign: 'center', borderTop: '1px solid #ddd' }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 Career-Link. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}
