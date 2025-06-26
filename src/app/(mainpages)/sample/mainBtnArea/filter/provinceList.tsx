'use client';

import React from 'react';
import { Paper, Box, Typography, TextField, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Region {
  id: string;
  label: string;
  count: number;
  children?: Region[];
}

const provinces: Region[] = [
  {
    id: 'seoul',
    label: '서울',
    count: 59674,
    children: [
      { id: 'seocho', label: '서초구', count: 7681 },
      { id: 'gangnam', label: '강남구', count: 18460 },
      { id: 'gangdong', label: '강동구', count: 1981 },
    ],
  },
  { id: 'gyeonggi', label: '경기', count: 50866, children: [] },
  // ... 추가 데이터
];

export interface ProvinceListProps {
  selected: string | null;
  onSelect: (_id: string | null) => void;
}

export default function ProvinceList({ selected, onSelect }: ProvinceListProps) {
  return (
    <Paper variant="outlined" sx={{ flex: 1, maxWidth: 240, p: 1, overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <ExpandMoreIcon fontSize="small" />
        <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
          대분류
        </Typography>
        <IconButton size="small" sx={{ ml: 'auto' }}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>
      <TextField
        size="small"
        placeholder="지역 검색"
        fullWidth
        sx={{ mb: 1 }}
        onChange={_e => {
          // optional filtering 로직 여기에 추가
        }}
      />
      {provinces.map(item => (
        <Box
          key={item.id}
          sx={{
            p: 0.5,
            borderRadius: 1,
            cursor: 'pointer',
            bgcolor: item.id === selected ? 'action.selected' : 'inherit',
          }}
          onClick={() => onSelect(item.id)}
        >
          <Typography variant="body2">
            {item.label} ({item.count.toLocaleString()})
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}
