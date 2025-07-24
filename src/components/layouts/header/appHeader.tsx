'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  Stack,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';
import Image from 'next/image';

import AppHeaderIconIsLogined from '@/components/layouts/header/appHeaderIconIsLogined';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

export default function AppHeader() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const navItems = [
    {
      label: 'Home',
      submenu: [
        { label: 'Submenu 1', href: '/submenu1' },
        { label: 'Submenu 2', href: '/submenu2' },
      ],
    },
    { label: 'Service', href: '/services' },
    { label: 'About', href: '/about' },
    {
      label: 'Sample',
      submenu: [
        { label: 'MainBtnArea', href: '/sample/mainBtnArea' },
        { label: 'SnackBar', href: '/sample/snackBar' },
      ],
    },
  ];

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

          <Box sx={{ display: 'flex', gap: 4 }}>
            {navItems.map(({ label, submenu, href }) => (
              <Box
                key={label}
                onClick={e => submenu && handleMenuClick(e, label)}
                sx={{
                  position: 'relative',
                  fontWeight: openMenu === label ? 600 : 400,
                  borderBottom: openMenu === label ? '2px solid #1976d2' : '2px solid transparent',
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
                      <Link key={i} href={item.href} passHref>
                        <MenuItem onClick={handleClose} sx={{ fontSize: 14 }}>
                          {item.label}
                        </MenuItem>
                      </Link>
                    ))}
                  </Menu>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right side icons */}
        <Box display="flex" alignItems="center" gap={2}>
          {isLoggedIn ? (
            <AppHeaderIconIsLogined />
          ) : (
            <>
              <Stack direction="row">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    router.push('/login');
                  }}
                >
                  로그인
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    router.push('/signup');
                  }}
                >
                  회원가입
                </Button>
                <IconButton
                  onClick={() => {
                    router.push('/emp');
                  }}
                >
                  <BusinessRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
