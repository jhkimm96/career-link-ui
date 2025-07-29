'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from '@/api/axios';
import { Dayjs } from 'dayjs';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
  FormGroup,
} from '@mui/material';
import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface EmployerInfo {
  employerId: string;
  companyTypeCode: string;
  companyName: string;
  bizRegNo: string;
  bizRegistrationUrl: string;
  ceoName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  establishedDate: Dayjs;
  industryCode: string;
  companyIntro: string;
  homepageUrl: string;
  companyLogoUrl: string;
  employeeCount: number;
}

export default function EmployerInfoPage() {
  const searchParams = useSearchParams();
  const employerId = searchParams.get('employerId');
  const [employer, setEmployer] = useState<EmployerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerInfo = async () => {
      try {
        if (!employerId) return;

        const res = await axios.get<EmployerInfo>('/emp/info', {
          params: { employerId },
        });
        setEmployer(res.data);
      } catch (error) {
        console.error('기업 정보 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerInfo();
  }, [employerId]);

  if (loading) return <div>기업 정보를 불러오는 중...</div>;
  if (!employer) return <div>기업 정보를 찾을 수 없습니다.</div>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, bgcolor: '#fcfcfc' }}>
        <Typography variant="h6" gutterBottom>
          제로베이스원 기업 정보
        </Typography>

        <Stack spacing={2} mt={2}>
          <TextField
            label="사업자등록번호"
            name="companyName"
            value={employer.companyName}
            fullWidth
          />
          <TextField label="이메일" value={employer.companyEmail} fullWidth />
          <TextField label="대표자명" value={employer.ceoName} fullWidth />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                value={employer.establishedDate}
                name="establishedDate"
                label={'설립일'}
                views={['year', 'month', 'day']}
              />
            </DemoContainer>
          </LocalizationProvider>
          <TextField label="기업분류" value={employer.companyTypeCode} fullWidth />
          <TextField label="업종" value={employer.industryCode} fullWidth />
          <TextField label="주소" value={employer.companyAddress} fullWidth />
          <TextField label="전화번호" value={employer.companyPhone} fullWidth />
          <TextField label="기업홈페이지" value={employer.homepageUrl} fullWidth />
          <FormControl variant="outlined">
            <OutlinedInput
              name="employeeCount"
              endAdornment={<InputAdornment position="end">명</InputAdornment>}
              aria-describedby="outlined-count-helper-text"
              inputProps={{
                'aria-label': '사원수',
              }}
              value={employer.employeeCount}
              fullWidth
            />
            <FormHelperText id="outlined-count-helper-text">사원수</FormHelperText>
          </FormControl>
          <FormGroup>
            <Box>
              <Button variant="outlined" component="label" fullWidth>
                기업사진 업로드
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={e => {
                    const file = e.target.files?.[0];
                  }}
                />
              </Button>
              {employer.companyLogoUrl && (
                <Typography variant="body2" mt={1}>
                  업로드된 파일: {employer.companyLogoUrl}
                </Typography>
              )}
            </Box>
          </FormGroup>
          <TextField
            id="standard-multiline-static"
            label="기업설명"
            value={employer.companyIntro}
            multiline
            rows={4}
            variant="standard"
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
          <Button variant="contained" color="primary">
            기업정보 저장
          </Button>
          <Button variant="outlined" color="inherit">
            기업회원가입
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
