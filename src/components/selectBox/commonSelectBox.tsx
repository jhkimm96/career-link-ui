'use client';

import React, { useEffect, useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';
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
  defaultOptionLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
};

export default function CommonSelectBox({
  groupCode,
  parentCode,
  value,
  onChange,
  label,
  defaultOptionLabel = '선택',
  disabled = false,
  fullWidth = true,
  size = 'small',
  sx,
}: CommonSelectBoxProps) {
  const [options, setOptions] = useState<CommonCode[]>([]);

  useEffect(() => {
    if (!groupCode) return;

    const fetchCodes = async () => {
      const res = parentCode
        ? await api.get('/common/children', { params: { groupCode, parentCode } })
        : await api.get('/common/parents', { params: { groupCode } });
      setOptions(res.data ?? []);
    };

    fetchCodes();
  }, [groupCode, parentCode]);

  const labelId = `${groupCode}-label`;
  const selectId = `${groupCode}-select`;

  return (
    <FormControl fullWidth={fullWidth} size={size} disabled={disabled} sx={sx} variant="outlined">
      {label && (
        <InputLabel id={labelId} shrink>
          {label}
        </InputLabel>
      )}
      <Select
        labelId={labelId}
        id={selectId}
        value={value}
        onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
        displayEmpty
        label={label}
        renderValue={selected => {
          if (!selected) {
            return <em>{defaultOptionLabel ?? '선택'}</em>;
          }
          const selectedOption = options.find(opt => opt.code === selected);
          return selectedOption?.codeName ?? selected;
        }}
      >
        {defaultOptionLabel && (
          <MenuItem value="">
            <em>{defaultOptionLabel}</em>
          </MenuItem>
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
