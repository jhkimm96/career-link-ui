'use client';

import React from 'react';
import { Box } from '@mui/material';

export interface FilterPanelProps {
  /** 필터 내용 (페이지에서 필요한 컴포넌트를 children으로 주입) */
  children: React.ReactNode;
}

/**
 * FilterPanel: 필터 영역 레이아웃 컨테이너
 * - collapse, toggle 기능은 MainButtonArea에서 처리
 * - 내부 필터 UI만 children으로 주입
 */
const FilterPanel: React.FC<FilterPanelProps> = ({ children }) => (
  <Box
    sx={{
      p: 2,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      maxHeight: '50vh',
      overflowY: 'auto',
    }}
  >
    {children}
  </Box>
);

export default FilterPanel;
