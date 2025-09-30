'use client';

import React from 'react';
import { Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export interface BasicFiltersProps {
  exp: string;
  edu: string;
  onExpChange: (_value: string) => void;
  onEduChange: (_value: string) => void;
}

export default function BasicFilters({ exp, edu, onExpChange, onEduChange }: BasicFiltersProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>경력</InputLabel>
        <Select
          value={exp}
          label="경력"
          onChange={e => onExpChange(e.target.value)}
          MenuProps={{
            // 드롭다운을 포탈이 아니라 현재 DOM 트리 안에 렌더
            disablePortal: true,
            // 메뉴 열 때 body 스크롤 락(lock)을 막아 스크롤바 흔들림 방지
            disableScrollLock: true,
          }}
        >
          <MenuItem value="">전체</MenuItem>
          <MenuItem value="new">신입</MenuItem>
          <MenuItem value="1">1년 이상</MenuItem>
          <MenuItem value="3">3년 이상</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>학력</InputLabel>
        <Select
          value={edu}
          label="학력"
          onChange={e => onEduChange(e.target.value)}
          MenuProps={{
            // 드롭다운을 포탈이 아니라 현재 DOM 트리 안에 렌더
            disablePortal: true,
            // 메뉴 열 때 body 스크롤 락(lock)을 막아 스크롤바 흔들림 방지
            disableScrollLock: true,
          }}
        >
          <MenuItem value="">전체</MenuItem>
          <MenuItem value="high">고졸</MenuItem>
          <MenuItem value="bachelor">학사 이상</MenuItem>
          <MenuItem value="master">석사 이상</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
