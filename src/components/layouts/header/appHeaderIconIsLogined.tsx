'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';
import { useState } from 'react';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from '@/api/axios';

import { IconButton, Button, Menu, MenuItem, Paper, Typography, Box } from '@mui/material';

interface ReissueResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
}

export default function AppHeaderIconIsLogined() {
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
      const newAccessTokenExpiresAt = res.data.accessTokenExpiresAt;

      if (newAccessToken) {
        const expiresAt = Date.now() + newAccessTokenExpiresAt;
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('accessTokenExpiresAt', expiresAt.toString());

        setIsLoggedIn(true);
        const now = Date.now();
        const remaining = Math.floor((+expiresAt - now) / 1000);
        setRemainingTime(remaining > 0 ? remaining : 0);
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
      console.log(localStorage.getItem('accessToken'));
      setIsLoggedIn(false);
      setRemainingTime(0);
      router.push('/main');
    } catch (e) {
      console.error('로그아웃 실패', e);
    }
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';

    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={2}>
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
      </Box>
    </>
  );
}
