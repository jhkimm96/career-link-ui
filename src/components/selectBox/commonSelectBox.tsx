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
  parentCode?: string;
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
  parentCode,
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
    if (!groupCode) return;

    const fetchCodes = async () => {
      let res;
      if (parentCode) {
        // 하위코드 API
        res = await api.get('/common/children', {
          params: { groupCode: groupCode, parentCode: parentCode },
        });
      } else {
        // 상위코드 API
        res = await api.get('/common/parents', {
          params: { groupCode: groupCode },
        });
      }
      setOptions(res.data ?? []);
    };

    fetchCodes();
  }, [groupCode, parentCode]);

  return (
    <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
      {label && <InputLabel shrink>{label}</InputLabel>}
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
