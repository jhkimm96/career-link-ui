'use client';

import AppLayout from '@/components/layouts/AppLayout';
import ThemeRegistry from '@/components/layouts/ThemeRegistry';
import { AuthProvider } from '@/libs/authContext';
import SessionWatcher from '@/components/SessionWatcher';
import React from 'react';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <AuthProvider>
        <SessionWrapper>{children}</SessionWrapper>
      </AuthProvider>
    </ThemeRegistry>
  );
}

function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionWatcher>
      <AppLayout>{children}</AppLayout>
    </SessionWatcher>
  );
}
