// components/providers/ThemeRegistry.tsx
'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';
import { ReactNode } from 'react';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  typography: {
    fontFamily: 'Noto Sans KR, sans-serif',
    fontSize: 13,
  },
  shadows: Array(25).fill('none') as ThemeOptions['shadows'],
};

const theme = createTheme(themeOptions);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
