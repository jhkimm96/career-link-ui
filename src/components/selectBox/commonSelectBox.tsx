'use client';

import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
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
  placeholder,
  disabled = false,
  fullWidth = true,
  size = 'small',
}: CommonSelectBoxProps) {
  const [options, setOptions] = useState<CommonCode[]>([]);

  useEffect(() => {
    const fetchCodes = async () => {
      const res = await api.get('/common/getCommonCodes', {
        params: { groupCode },
      });
      setOptions(res.data ?? []);
    };

    fetchCodes();
  }, [groupCode]);

  return (
    <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
      {label && <InputLabel shrink={true}>{label}</InputLabel>}
      <Select
        value={value}
        onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
        displayEmpty
        renderValue={selected => {
          if (!selected) {
            return <em>{placeholder ?? '선택'}</em>;
          }
          const selectedOption = options.find(opt => opt.code === selected);
          return selectedOption?.codeName ?? selected;
        }}
      >
        {placeholder && (
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {!options.some(opt => opt.code === value) && value && (
          <MenuItem value={value}>{value}</MenuItem>
        )}
        {options.map(({ code, codeName }) => (
          <MenuItem key={code} value={code}>
            {codeName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
