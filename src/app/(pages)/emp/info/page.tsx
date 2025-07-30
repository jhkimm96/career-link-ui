'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/api/axios';
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
import KakaoPostcode from '@/components/kakaoPostCode';

interface EmployerInfo {
  employerId: string;
  companyTypeCode: string;
  companyName: string;
  bizRegNo: string;
  bizRegistrationUrl: string;
  ceoName: string;
  companyPhone: string;
  companyEmail: string;
  baseAddress: string;
  detailAddress: string;
  postcode: string;
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
  const [form, setForm] = useState<EmployerInfo | null>(null);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAddress = (address: string, postcode: string) => {
    setForm(prev =>
      prev
        ? {
            ...prev,
            baseAddress: address,
            postcode: postcode,
          }
        : null
    );
  };

  useEffect(() => {
    const fetchEmployerInfo = async () => {
      if (!employerId) return;

      try {
        const res = await api.get<EmployerInfo>('/emp/info', {
          params: { employerId },
        });
        setEmployer(res.data);
        setForm(res.data);
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

  const handleSave = async () => {
    if (!form) return;

    try {
      const formData = new FormData();

      // employerId 반드시 추가
      if (employerId) {
        formData.append('employerId', employerId);
      }

      // 문자열 필드들 추가
      for (const key in form) {
        const value = form[key as keyof EmployerInfo];
        if (value instanceof Object && 'isValid' in value) {
          // Dayjs 처리
          formData.append(key, (value as Dayjs).format('YYYY-MM-DD'));
        } else {
          formData.append(key, String(value));
        }
      }

      // 파일 추가
      // if (selectedFile) {
      //   formData.append('companyLogo', selectedFile);
      // }

      await api.put(
        `/emp/info/save?employerId=${employerId}`,
        formData
        //   , {
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // },
        // }
      );

      alert('기업정보가 저장되었습니다.');
    } catch (error) {
      console.error('기업 정보 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

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
            value={employer.companyName || ''}
            disabled
            fullWidth
          />
          <TextField label="이메일" value={employer.companyEmail} disabled fullWidth />
          <TextField
            label="대표자명"
            value={form?.ceoName || ''}
            onChange={e => setForm(prev => (prev ? { ...prev, ceoName: e.target.value } : null))}
            fullWidth
          />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                value={form?.establishedDate}
                onChange={newDate =>
                  setForm(prev => (prev ? { ...prev, establishedDate: newDate! } : null))
                }
                name="establishedDate"
                label="설립일"
                views={['year', 'month', 'day']}
              />
            </DemoContainer>
          </LocalizationProvider>
          <TextField label="기업분류" value={employer.companyTypeCode} fullWidth />
          <TextField label="업종" value={employer.industryCode} fullWidth />
          <KakaoPostcode onAddressSelect={handleAddress} />
          <TextField
            label="상세주소"
            value={form?.detailAddress || ''}
            onChange={e =>
              setForm(prev => (prev ? { ...prev, detailAddress: e.target.value } : null))
            }
            fullWidth
          />
          <TextField
            label="전화번호"
            value={form?.companyPhone || ''}
            onChange={e =>
              setForm(prev => (prev ? { ...prev, companyPhone: e.target.value } : null))
            }
            fullWidth
          />
          <TextField
            label="기업홈페이지"
            value={form?.homepageUrl || ''}
            onChange={e =>
              setForm(prev => (prev ? { ...prev, homepageUrl: e.target.value } : null))
            }
            fullWidth
          />
          <FormControl variant="outlined">
            <OutlinedInput
              name="employeeCount"
              endAdornment={<InputAdornment position="end">명</InputAdornment>}
              aria-describedby="outlined-count-helper-text"
              inputProps={{
                'aria-label': '사원수',
              }}
              value={form?.employeeCount || ''}
              onChange={e =>
                setForm(prev =>
                  prev ? { ...prev, employeeCount: parseInt(e.target.value, 10) || 0 } : null
                )
              }
              fullWidth
            />
            <FormHelperText id="outlined-count-helper-text">사원수</FormHelperText>
          </FormControl>
          <FormGroup>
            {/*<Box>*/}
            {/*  <Button variant="outlined" component="label" fullWidth>*/}
            {/*    기업로고 업로드*/}
            {/*    <input*/}
            {/*      type="file"*/}
            {/*      accept="image/*,.pdf"*/}
            {/*      hidden*/}
            {/*      onChange={e => {*/}
            {/*        const file = e.target.files?.[0];*/}
            {/*        if (file) {*/}
            {/*          setSelectedFile(file);*/}
            {/*        }*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  </Button>*/}
            {/*  {employer.companyLogoUrl && (*/}
            {/*    <Typography variant="body2" mt={1}>*/}
            {/*      업로드된 파일: {employer.companyLogoUrl}*/}
            {/*    </Typography>*/}
            {/*  )}*/}
            {/*</Box>*/}
          </FormGroup>
          <TextField
            id="standard-multiline-static"
            label="기업설명"
            value={form?.companyIntro || ''}
            onChange={e =>
              setForm(prev => (prev ? { ...prev, companyIntro: e.target.value } : null))
            }
            multiline
            rows={4}
            variant="standard"
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
          <Button variant="contained" color="primary" onClick={handleSave}>
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
