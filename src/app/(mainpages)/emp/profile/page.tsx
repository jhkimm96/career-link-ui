'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Building2 } from 'lucide-react';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError } from '@/api/apiNotify';
import { useRouter, useSearchParams } from 'next/navigation';

interface JobPostingSummary {
  jobPostingId: number;
  title: string;

  jobFieldCode?: string | null;
  jobFieldName?: string | null;

  locationCode?: string | null;
  locationName?: string | null;

  employmentTypeCode?: string | null;
  employmentTypeName?: string | null;

  careerLevelCode?: string | null;
  careerLevelName?: string | null;

  salaryCode?: string | null;
  salaryName?: string | null;

  applicationDeadline?: string | null;
  viewCount: number;
}

interface EmployerPublicProfile {
  employerId: string;
  companyName: string;
  companyLogoUrl: string | null;
  homepageUrl: string | null;
  companyIntro: string | null;
  locationCode: string | null;
  locationName: string | null;

  activePostingCount: number;
  hiring: boolean;

  recentPostings: JobPostingSummary[];
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

const formatDeadline = (val?: string | null) => {
  if (!val) return '상시모집';
  const d = dayjs(val);
  return d.isValid() ? d.format('YYYY-MM-DD') : val;
};

export default function EmpProfileViewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const employerId = id && id !== 'undefined' ? decodeURIComponent(id) : '';

  const [data, setData] = useState<EmployerPublicProfile | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  const logoSrc = useMemo(() => data?.companyLogoUrl || '', [data?.companyLogoUrl]);
  const handleClose = () => closeSnackbar(setSnackbar);

  useEffect(() => {
    if (!employerId) {
      notifyError(setSnackbar, '잘못된 접근입니다. 기업 식별자가 없습니다.');
      return;
    }
    (async () => {
      try {
        const res = await api.get<EmployerPublicProfile>(
          `/public/employers/${encodeURIComponent(employerId)}`
        );
        setData(res.data ?? null);
      } catch (err: any) {
        notifyError(setSnackbar, '기업 정보를 찾을 수 없습니다. 관리자에게 문의하세요.');
      }
    })();
  }, [employerId]);

  const handleOpenPosting = (jobPostingId: number) => {
    router.push(`/job-postings/detail?id=${encodeURIComponent(String(jobPostingId))}`);
  };

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
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Building2 size={22} />
              <Typography variant="h6">{data?.companyName || '기업 정보'}</Typography>
              {typeof data?.activePostingCount === 'number' && (
                <Chip
                  size="small"
                  label={`공고 ${data.activePostingCount.toLocaleString()}건`}
                  sx={{ ml: { xs: 0, md: 1 } }}
                />
              )}
              {data?.hiring && <Chip size="small" color="success" label="채용 진행중" />}
            </Stack>
            {data?.locationName && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {data.locationName}
              </Typography>
            )}
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

        {/* 기본 정보 */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            기본 정보
          </Typography>
          <DetailRow label="기업명" value={data?.companyName} />
          <DetailRow
            label="홈페이지"
            value={
              data?.homepageUrl ? (
                <Link href="/login" target="_blank" rel="noopener noreferrer">
                  {data.homepageUrl}
                </Link>
              ) : (
                '—'
              )
            }
          />
          <DetailRow label="기업소개" value={data?.companyIntro} />
          <DetailRow label="지역" value={data?.locationName ?? data?.locationCode ?? '—'} />
        </Stack>

        {/* 최근 공고 보기 */}
        <Stack spacing={1} direction="row" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            최근 공고
          </Typography>
          {data?.recentPostings?.length ? (
            <Chip
              size="small"
              label={`${data.recentPostings.length.toLocaleString()}건`}
              variant="outlined"
            />
          ) : null}
        </Stack>

        {data?.recentPostings?.length ? (
          <Grid container spacing={2}>
            {data.recentPostings.map(jp => {
              const chips = [
                jp.employmentTypeName,
                jp.careerLevelName,
                jp.jobFieldName,
                jp.locationName,
                jp.salaryName,
              ].filter(Boolean) as string[];

              return (
                <Box
                  key={jp.jobPostingId}
                  sx={{
                    width: { xs: '100%', md: '50%' },
                    p: 1,
                    boxSizing: 'border-box',
                  }}
                >
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => handleOpenPosting(jp.jobPostingId)}>
                      <CardContent>
                        <Tooltip title="공고 상세보기" arrow>
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom noWrap>
                            {jp.title}
                          </Typography>
                        </Tooltip>

                        <Stack direction="row" spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            마감일: {formatDeadline(jp.applicationDeadline)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            조회수: {jp.viewCount?.toLocaleString?.() ?? 0}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })}
          </Grid>
        ) : (
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 2, textAlign: 'center', color: 'text.secondary' }}
          >
            표시할 최근 공고가 없습니다.
          </Paper>
        )}
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
