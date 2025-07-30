// components/common/PageSectionLayout.tsx
'use client';

import React, { ReactNode } from 'react';
import { Container, Box, Typography, Divider } from '@mui/material';

interface PageSectionLayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function PageSectionLayout({ title, actions, children }: PageSectionLayoutProps) {
  // children 개수에 따라 1열 혹은 2열 그리드
  const count = React.Children.count(children);
  const template = count <= 1 ? '1fr' : '1fr 1fr';

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">{title}</Typography>
        {actions && <Box>{actions}</Box>}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: template,
          gap: 4,
          alignItems: 'stretch',
        }}
      >
        {children}
      </Box>
    </Container>
  );
}
