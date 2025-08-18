'use client';

import { useEffect, useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import api from '@/api/axios';

type CommonCode = {
  code: string;
  codeName: string;
};

type CommonSelectBoxProps = {
  groupCode: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
};

export default function CommonSelectBox({
  groupCode,
  value,
  onChange,
  label,
  placeholder = '선택',
  disabled = false,
  fullWidth = true,
  size = 'small',
}: CommonSelectBoxProps) {
  const [options, setOptions] = useState<CommonCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCodes = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/getCommonCodes', {
          params: { groupCode },
        });
        setOptions(res.data ?? []);
      } catch (err) {
        console.error(`공통코드(${groupCode}) 조회 실패`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, [groupCode]);

  return (
    <FormControl fullWidth={fullWidth} size={size} disabled={disabled || loading}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={value}
        onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
        label={label}
        displayEmpty
      >
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
        {options.map(({ code, codeName }) => (
          <MenuItem key={code} value={code}>
            {codeName}
          </MenuItem>
        ))}
      </Select>
      {loading && <CircularProgress size={20} sx={{ position: 'absolute', top: 10, right: 10 }} />}
    </FormControl>
  );
}
