'use client';

import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Button,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';
import api from '@/api/axios';
import { useState } from 'react';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';

interface ReissueResponse {
  accessToken: string;
}

export default function AppHeader() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn, remainingTime, setRemainingTime } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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
      const res = await api.post<ReissueResponse>('/api/users/reissue', {});
      const newAccessToken = res.data.accessToken;
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        setRemainingTime(15 * 60);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('세션 연장 실패', e);
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
    } catch (e) {
      console.error('로그아웃 실패', e);
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
        </Box>

        {/* Right side icons */}
        <Box display="flex" alignItems="center" gap={2}>
          {isLoggedIn ? (
            <>
              <IconButton>
                <MailOutlineIcon fontSize="small" />
              </IconButton>
              <IconButton>
                <NotificationsNoneIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={e => handleMenuClick(e, 'logout')}>
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
                    router.push('/mypage');
                  }}
                >
                  마이페이지
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    handleLogout();
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
                  onClick={handleExtendSession}
                  variant="outlined"
                  size="small"
                  sx={{
                    ml: 1,
                    fontSize: '10px',
                    borderColor: 'white',
                    color: 'white',
                    px: 0.8,
                    py: 0.3,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  연장
                </Button>
              </Paper>
            </>
          ) : (
            <Stack direction="row">
              <Link href="/login">
                <Button variant="text" size="small">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="text" size="small">
                  회원가입
                </Button>
              </Link>
              <Link href="/emp">
                <IconButton>
                  <BusinessRoundedIcon fontSize="small" />
                </IconButton>
              </Link>
            </Stack>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
