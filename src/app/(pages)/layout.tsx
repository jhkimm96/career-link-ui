'use client';

import AppLayout from '@/components/layouts/AppLayout';
import ThemeRegistry from '@/components/layouts/ThemeRegistry';
import { ReactNode } from 'react';

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-25">
      <ThemeRegistry>
        <AppLayout>{children}</AppLayout>
      </ThemeRegistry>
    </div>
  );
}
