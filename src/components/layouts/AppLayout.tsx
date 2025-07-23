'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem, Container } from '@mui/material';
import Footer from '@/components/layouts/footer';
import AppHeader from '@/components/layouts/header/appHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <AppHeader />
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        {children}
      </Container>
      {/* Footer */}
      <Footer />
    </>
  );
}
