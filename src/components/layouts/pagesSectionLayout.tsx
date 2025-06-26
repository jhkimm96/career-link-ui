'use client';

import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PagesSectionLayoutProps {
  title?: string;
  children: ReactNode;
}
export default function PagesSectionLayout({ title, children }: PagesSectionLayoutProps) {
  const count = React.Children.count(children);
  const template = count <= 1 ? '1fr' : '1fr 1fr';
  return (
    <Box sx={{ pb: { xs: 18, sm: 14 }, minHeight: '40vh' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          minHeight: '40vh',
          gridTemplateColumns: template,
          gap: 4,
          alignItems: 'stretch',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
