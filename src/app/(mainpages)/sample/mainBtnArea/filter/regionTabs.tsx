'use client';

import React from 'react';
import { Tabs, Tab } from '@mui/material';

interface RegionTabsProps {
  value: number;
  onChange: (_value: number) => void;
}

export default function RegionTabs({ value, onChange }: RegionTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, newVal) => onChange(newVal)}
      textColor="primary"
      indicatorColor="primary"
      sx={{ mb: 2 }}
    >
      <Tab label="국내" />
      <Tab label="해외" />
    </Tabs>
  );
}
