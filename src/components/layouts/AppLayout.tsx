'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircle from '@mui/icons-material/AccountCircle';

const navItems = [
  { label: 'Home', href: '/', submenu: ['Submenu 1', 'Submenu 2'] },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
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

          {/* Icons */}
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton size="large">
              <MailOutlineIcon fontSize="small" />
            </IconButton>
            <IconButton size="large">
              <NotificationsNoneIcon fontSize="small" />
            </IconButton>
            <IconButton size="large">
              <AccountCircle fontSize="small" />
            </IconButton>
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
