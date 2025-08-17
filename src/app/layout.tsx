import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import ScrollToTopRoute from '@/components/layouts/scrollToTopRoute';
import ScrollToTopButton from '@/components/layouts/scrollToTopButton';
import { AuthProvider } from '@/libs/authContext';
import SessionWatcher from '@/components/SessionWatcher';
import { ConfirmProvider } from '@/components/confirm';

export const metadata: Metadata = {
  title: 'Career Link',
  description: '채용 시스템 캐리',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ConfirmProvider>
          <AuthProvider>
            <SessionWatcher>
              <ScrollToTopRoute />
              {children}
              <ScrollToTopButton />
            </SessionWatcher>
          </AuthProvider>
        </ConfirmProvider>
      </body>
    </html>
  );
}
