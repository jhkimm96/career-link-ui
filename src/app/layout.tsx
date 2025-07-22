import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import ScrollToTopRoute from '@/components/layouts/scrollToTopRoute';
import ScrollToTopButton from '@/components/layouts/scrollToTopButton';

export const metadata: Metadata = {
  title: 'Career Link',
  description: '채용 시스템 캐리',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ScrollToTopRoute />
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
