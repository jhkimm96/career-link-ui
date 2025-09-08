'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  List,
  ListItemButton,
  Radio,
  ListItemText,
  DialogActions,
} from '@mui/material';
import api from '@/api/axios';
import { CommonCodesApi, CommonCode } from '@/api/commonCodes';

type JobPostingResponse = {
  jobPostingId: number;
  title: string;
  description: string;
  employerId: string;
  companyName: string;
  jobFieldCode: string | null;
  educationLevelCode: string | null;
  locationCode: string | null;
  employmentTypeCode: string | null;
  careerLevelCode: string | null;
  salaryCode: string | null;
  applicationDeadline: string | null;
  isActive: 'Y' | 'N' | string;
};

type ResumeSummary = {
  resumeId: string | number;
  title: string;
  updatedAt?: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return '상시모집';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

export default function JobPostingDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [detail, setDetail] = useState<JobPostingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [codeNameMap, setCodeNameMap] = useState<Record<string, string>>({});

  const [applyOpen, setApplyOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | number | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyDone, setApplyDone] = useState(false);

  const fetchCodes = async () => {
    const groups = [
      'JOB_FIELD',
      'LOCATION',
      'EDUCATION_LEVEL',
      'EMPLOYMENT_TYPE',
      'CAREER_LEVEL',
      'SALARY',
    ];
    const results = await Promise.all(groups.map(g => CommonCodesApi.all(g)));

    const map: Record<string, string> = {};
    results.forEach(arr => {
      (arr ?? []).forEach((c: CommonCode) => {
        map[c.code] = c.codeName;
      });
    });
    setCodeNameMap(map);
  };

  useEffect(() => {
    if (!id) {
      setErr('잘못된 접근입니다.');
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const { data } = await api.get<JobPostingResponse>(`/job/job-posting/detail`, {
          params: { id },
        });
        if (!mounted) return;
        setDetail(data);

        await fetchCodes();
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? '조회 중 오류가 발생했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const chips = useMemo(() => {
    if (!detail) return [];
    const nameOf = (code?: string | null) => (code ? (codeNameMap[code] ?? code) : undefined);

    const list: string[] = [];
    const employmentType = nameOf(detail.employmentTypeCode);
    const career = nameOf(detail.careerLevelCode);
    const education = nameOf(detail.educationLevelCode);
    const jobField = nameOf(detail.jobFieldCode);
    const location = nameOf(detail.locationCode);
    const salary = nameOf(detail.salaryCode);

    if (employmentType) list.push(employmentType);
    if (career) list.push(career);
    if (education) list.push(education);
    if (jobField) list.push(jobField);
    if (location) list.push(location);
    if (salary) list.push(salary);

    return list;
  }, [detail, codeNameMap]);

  const openApplyModal = async () => {
    setApplyOpen(true);
    setResumes([]);
    setSelectedResumeId(null);
    setResumeError(null);
    setApplyError(null);
    setApplyDone(false);
    try {
      setResumesLoading(true);
      const { data } = await api.get<ResumeSummary[]>(`/resume/my`);
      setResumes(data ?? []);
    } catch (e: any) {
      setResumeError(e?.message ?? '이력서 목록을 불러오지 못했어요.');
    } finally {
      setResumesLoading(false);
    }
  };

  const submitApplication = async () => {
    if (!detail || !selectedResumeId) return;
    try {
      setApplying(true);
      setApplyError(null);
      await api.post(`/job/apply`, {
        jobPostingId: detail.jobPostingId,
        resumeId: selectedResumeId,
      });
      setApplyDone(true);
    } catch (e: any) {
      setApplyError(e?.message ?? '지원 처리 중 오류가 발생했습니다.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
          gap: { xs: 2, lg: 3 },
          alignItems: 'start',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            order: { xs: 0, lg: 1 },
            position: { lg: 'sticky' },
            top: { lg: 16 },
            alignSelf: 'start',
            zIndex: 1,
          }}
        >
          <RightStickyCard
            loading={loading}
            companyName={detail?.companyName}
            chips={chips}
            deadline={detail?.applicationDeadline ?? null}
            onApply={openApplyModal}
          />
        </Box>

        <Box sx={{ order: { xs: 1, lg: 0 } }}>
          <MainContent loading={loading} err={err} detail={detail} />
        </Box>
      </Box>

      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>이력서 선택</DialogTitle>
        <DialogContent dividers>
          {resumeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resumeError}
            </Alert>
          )}

          {resumesLoading ? (
            <Stack spacing={1.2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Stack>
          ) : resumes.length === 0 ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
              <Typography color="text.secondary">저장된 이력서가 없습니다.</Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setApplyOpen(false);
                  router.push('/resume/form');
                }}
              >
                이력서 작성하러 가기
              </Button>
            </Stack>
          ) : (
            <List sx={{ py: 0 }}>
              {resumes.map(r => {
                const selected = String(selectedResumeId ?? '') === String(r.resumeId);
                return (
                  <ListItemButton
                    key={String(r.resumeId)}
                    onClick={() => setSelectedResumeId(r.resumeId)}
                    selected={selected}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <Radio edge="start" checked={selected} tabIndex={-1} />
                    <ListItemText
                      primary={r.title}
                      secondary={
                        r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : undefined
                      }
                      primaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>닫기</Button>
          <Button
            variant="contained"
            disabled={!selectedResumeId || applying || applyDone}
            onClick={submitApplication}
          >
            {applyDone ? '지원 완료' : applying ? '지원 중...' : '지원하기'}
          </Button>
        </DialogActions>
        {applyError && (
          <Alert severity="error" sx={{ m: 2, mt: 0 }}>
            {applyError}
          </Alert>
        )}
        {applyDone && (
          <Alert severity="success" sx={{ m: 2, mt: 1 }}>
            지원이 정상적으로 접수되었습니다.
          </Alert>
        )}
      </Dialog>
    </Box>
  );
}

function MainContent({
  loading,
  err,
  detail,
}: {
  loading: boolean;
  err: string | null;
  detail: JobPostingResponse | null;
}) {
  if (loading) {
    return (
      <Card sx={{ p: 2 }}>
        <Skeleton variant="text" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        <Divider sx={{ my: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Card>
    );
  }

  if (err) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          오류
        </Typography>
        <Typography>{err}</Typography>
      </Card>
    );
  }

  if (!detail) return null;

  return (
    <Card>
      <Box sx={{ p: { xs: 2, md: 3 }, border: '1px solid #ddd', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {detail.title}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {detail.companyName}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
            '& h1, & h2, & h3': { mt: 3 },
            '& p': { lineHeight: 1.8 },
          }}
          dangerouslySetInnerHTML={{ __html: detail.description ?? '' }}
        />
      </Box>
    </Card>
  );
}

function RightStickyCard({
  loading,
  companyName,
  chips,
  deadline,
  onApply,
}: {
  loading: boolean;
  companyName?: string | null;
  chips: string[];
  deadline: string | null;
  onApply: () => void;
}) {
  return (
    <Card
      sx={{
        height: 'fit-content',
        border: '1px solid #ddd',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        {loading ? (
          <>
            <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={22} sx={{ mb: 2 }} />
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width={64} height={28} />
              ))}
            </Stack>
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              {companyName ?? '회사명'}
            </Typography>

            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
              {chips.slice(0, 6).map((c, i) => (
                <Chip key={`c-${i}`} label={c} size="small" />
              ))}
              {chips.length > 6 && <Chip label={`+${chips.length - 6}`} size="small" />}
            </Stack>

            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                마감일
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {formatDate(deadline)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onApply}
              disableElevation
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              지원하기
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
