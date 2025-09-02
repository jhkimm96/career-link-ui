'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/api/axios';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Trash2 as TrashIcon, Building2 } from 'lucide-react';
import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import KakaoPostcode from '@/components/kakaoPostCode';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import MainButtonArea from '@/components/mainBtn/mainButtonArea';
import { useS3Upload } from '@/hooks/useS3Upload';
import FileUpload from '@/components/fileUpload';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';

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
  establishedDate: Dayjs | null;
  industryCode: string;
  companyIntro: string;
  homepageUrl: string;
  companyLogoUrl: string;
  employeeCount: number | null;
}

export default function EmpProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { previewUrl, selectedFile, setFile } = useS3Upload({ uploadType: 'COMPANY_LOGO' });

  const [form, setForm] = useState<EmployerInfo | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'info' | 'success' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'info' });

  // 로고 미리보기 소스 선택(선택 파일 > 기존 URL)
  const logoSrc = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (form?.companyLogoUrl) return form.companyLogoUrl;
    return '';
  }, [previewUrl, form?.companyLogoUrl]);

  // 주소검색 결과 반영
  const handleAddress = (address: string, postcode: string) => {
    setForm(prev => (prev ? { ...prev, baseAddress: address, postcode } : prev));
  };

  // SnackBar 닫기 이벤트
  const handleClose = () => closeSnackbar(setSnackbar);

  // 기업정보 조회
  useEffect(() => {
    const fetchEmployerInfo = async () => {
      try {
        const res = await api.get<
          Omit<EmployerInfo, 'establishedDate'> & { establishedDate: string | null }
        >('/emp/info'); // ← params 제거

        const data = res.data as any;
        setForm({
          ...data,
          establishedDate: data.establishedDate ? dayjs(data.establishedDate) : null,
          employeeCount:
            typeof data.employeeCount === 'number'
              ? data.employeeCount
              : Number(data.employeeCount ?? 0),
        });
      } catch (err: any) {
        notifyError(setSnackbar, '기업 정보를 찾을 수 없습니다. 관리자에게 문의하세요.');
      }
    };
    fetchEmployerInfo();
  }, []); // ← employerId 의존성 제거

  const handleChange =
    <K extends keyof EmployerInfo>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setForm(prev =>
        prev
          ? {
              ...prev,
              [key]:
                key === 'employeeCount'
                  ? v === ''
                    ? null
                    : (Number(v.replaceAll(/[^0-9]/g, '')) as any)
                  : (v as any),
            }
          : prev
      );
    };

  const handleSave = async () => {
    if (!form) return;

    try {
      const dto = {
        ...form,
        establishedDate: form.establishedDate
          ? dayjs(form.establishedDate).format('YYYY-MM-DD')
          : null,
      };

      const formData = new FormData();
      formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

      if (selectedFile) {
        formData.append('companyLogo', selectedFile);
      }

      await api.put('/emp/info/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notifySuccess(setSnackbar, '기업정보가 저장되었습니다.');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <Container maxWidth="md" className="py-6">
      <Paper
        elevation={0}
        className="p-6 rounded-2xl shadow-sm border"
        sx={{ background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%)' }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Building2 size={22} />
              <Typography variant="h6">{form?.companyName || '기업 정보'}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              사업자등록번호 {form?.bizRegNo || '-'} · 대표 {form?.ceoName || '-'}
            </Typography>
          </Box>

          <Card sx={{ width: { xs: '100%', md: 260 }, borderRadius: 3 }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1">기업 이미지</Typography>
                  {logoSrc && (
                    <Tooltip title="이미지 제거">
                      <IconButton
                        size="small"
                        onClick={async () => {
                          try {
                            if (form?.companyLogoUrl) {
                              await api.delete('/emp/info/logo');
                              setForm(prev => (prev ? { ...prev, companyLogoUrl: '' } : prev));
                              notifySuccess(setSnackbar, '이미지가 삭제되었습니다.');
                            }
                          } catch (err: any) {
                            notifyError(setSnackbar, '이미지 삭제에 실패했습니다.');
                          }
                        }}
                      >
                        <TrashIcon size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              }
            />
            <CardContent>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px dashed #e0e0e0',
                  backgroundColor: '#fafafa',
                  aspectRatio: '4 / 3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="기업 로고"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                      <Building2 size={28} />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      이미지가 없습니다
                    </Typography>
                  </Stack>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <FileUpload
                  previewUrl={undefined /* 카드에서 미리보기 렌더링 */}
                  label={'이미지 선택'}
                  accept="image/*"
                  onFileChange={file => {
                    if (file) setFile(file);
                    else setFile(null as any);
                  }}
                  fileName={selectedFile?.name ?? ''}
                />
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr' },
            gap: 3,
          }}
        >
          <Box>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                기본 정보
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <TextField label="사업자등록번호" value={form?.bizRegNo ?? ''} disabled fullWidth />
                <TextField label="대표자명" value={form?.ceoName ?? ''} disabled fullWidth />
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                  <DatePicker
                    value={form?.establishedDate ?? null}
                    label="설립일"
                    format="YYYY/MM/DD"
                    views={['year', 'month', 'day']}
                    disabled
                    onChange={v =>
                      setForm(prev => (prev ? { ...prev, establishedDate: v ?? null } : prev))
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>

                <Box
                  sx={{
                    gridColumn: '1 / -1', // 부모 그리드에서 전체 폭 차지
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, // 안쪽에서 2열
                    gap: 2,
                  }}
                >
                  {/* 기업분류 */}
                  <CommonSelectBox
                    groupCode="COMPANY_CLASS"
                    value={form?.companyTypeCode ?? ''}
                    onChange={(code: string) =>
                      setForm(prev => (prev ? { ...prev, companyTypeCode: code } : prev))
                    }
                  />

                  {/* 업종 */}
                  <CommonSelectBox
                    groupCode="INDUSTRY"
                    value={form?.industryCode ?? ''}
                    onChange={(code: string) =>
                      setForm(prev => (prev ? { ...prev, industryCode: code } : prev))
                    }
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                연락처 & 웹
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <TextField
                  label="대표 이메일"
                  value={form?.companyEmail ?? ''}
                  disabled
                  fullWidth
                />

                <TextField
                  label="전화번호"
                  value={form?.companyPhone ?? ''}
                  onChange={handleChange('companyPhone')}
                  fullWidth
                />

                <TextField
                  label="기업홈페이지"
                  value={form?.homepageUrl ?? ''}
                  onChange={handleChange('homepageUrl')}
                  fullWidth
                />
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                주소
              </Typography>
              <Stack spacing={1}>
                <KakaoPostcode onAddressSelect={handleAddress} />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="상세주소"
                    value={form?.detailAddress ?? ''}
                    onChange={handleChange('detailAddress')}
                    fullWidth
                  />
                </Box>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                조직
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <FormControl variant="outlined" fullWidth>
                  <OutlinedInput
                    name="employeeCount"
                    endAdornment={<InputAdornment position="end">명</InputAdornment>}
                    aria-describedby="outlined-count-helper-text"
                    inputProps={{
                      'aria-label': '사원수',
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    value={form?.employeeCount ?? ''}
                    onChange={handleChange('employeeCount')}
                  />
                  <FormHelperText id="outlined-count-helper-text">사원수</FormHelperText>
                </FormControl>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="기업설명"
                    value={form?.companyIntro ?? ''}
                    onChange={handleChange('companyIntro')}
                    multiline
                    rows={4}
                    fullWidth
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <MainButtonArea saveAction={handleSave} saveLabel="기업정보저장" />
        </Box>
      </Paper>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
        bottom="80px"
      />
    </Container>
  );
}
