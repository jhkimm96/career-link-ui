'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  Avatar,
} from '@mui/material';
import { Building2 } from 'lucide-react';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError } from '@/api/apiNotify';

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

// 단일 필드 표시 전용 컴포넌트
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' },
        alignItems: 'flex-start',
        gap: 1.5,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function EmpProfileViewPage() {
  const [form, setForm] = useState<EmployerInfo | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'info' | 'success' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'info' });

  // 로고 소스
  const logoSrc = useMemo(() => form?.companyLogoUrl || '', [form?.companyLogoUrl]);

  const handleClose = () => closeSnackbar(setSnackbar);

  // 기업정보 조회 (읽기 전용)
  useEffect(() => {
    const fetchEmployerInfo = async () => {
      try {
        const res = await api.get<
          Omit<EmployerInfo, 'establishedDate'> & { establishedDate: string | null }
        >('/emp/info');

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
  }, []);

  return (
    <Container maxWidth="md" className="py-6">
      <Paper
        elevation={0}
        className="p-6 rounded-2xl shadow-sm border"
        sx={{ background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%)' }}
      >
        {/* 헤더 */}
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
              사업자등록번호 {form?.bizRegNo || '—'} · 대표 {form?.ceoName || '—'}
            </Typography>
          </Box>

          {/* 기업 이미지 */}
          <Card sx={{ width: { xs: '100%', md: 260 }, borderRadius: 3 }}>
            <CardHeader title={<Typography variant="subtitle1">기업 이미지</Typography>} />
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
            </CardContent>
          </Card>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* 상세 정보 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 3 }}>
          <Box>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                기본 정보
              </Typography>

              <DetailRow label="사업자등록번호" value={form?.bizRegNo} />
              <DetailRow label="대표자명" value={form?.ceoName} />
              <DetailRow
                label="설립일"
                value={
                  form?.establishedDate ? dayjs(form.establishedDate).format('YYYY/MM/DD') : '—'
                }
              />
              <DetailRow label="기업분류 코드" value={form?.companyTypeCode} />
              <DetailRow label="업종 코드" value={form?.industryCode} />

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                연락처 & 웹
              </Typography>

              <DetailRow label="대표 이메일" value={form?.companyEmail} />
              <DetailRow label="전화번호" value={form?.companyPhone} />
              <DetailRow
                label="기업홈페이지"
                value={
                  form?.homepageUrl ? (
                    <a href={form.homepageUrl} target="_blank" rel="noopener noreferrer">
                      {form.homepageUrl}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                주소
              </Typography>
              <DetailRow label="우편번호" value={form?.postcode} />
              <DetailRow label="기본주소" value={form?.baseAddress} />
              <DetailRow label="상세주소" value={form?.detailAddress} />

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                조직
              </Typography>
              <DetailRow
                label="사원수"
                value={
                  typeof form?.employeeCount === 'number' && form?.employeeCount >= 0
                    ? `${form.employeeCount.toLocaleString()}명`
                    : '—'
                }
              />
              <DetailRow label="기업설명" value={form?.companyIntro} />
            </Stack>
          </Box>
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
