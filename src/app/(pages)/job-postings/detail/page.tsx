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
  Tooltip,
} from '@mui/material';
import api from '@/api/axios';
import { CommonCodesApi, CommonCode } from '@/api/commonCodes';
import MainButtonArea from '@/components/mainBtn/mainButtonArea';
import { useAuth } from '@/libs/authContext';
import { ResumeDto } from '@/types/applicant/resume';
import { CoverLetterDto } from '@/types/applicant/coverLetter';
import { ApplicationDto } from '@/types/applicant/application';
import { useConfirm } from '@/components/confirm';
import ApplicationPreviewDialog from '@/components/dialog/jobPosting/ApplicationPreviewDialog';
import NotificationSnackbar from '@/components/snackBar';
import { notifySuccess, notifyError, closeSnackbar } from '@/api/apiNotify';

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
  const { role, employerId, isLoggedIn } = useAuth();
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [detail, setDetail] = useState<JobPostingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [codeNameMap, setCodeNameMap] = useState<Record<string, string>>({});

  // 지원 다이얼로그 상태
  const [applyOpen, setApplyOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetterDto[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Snackbar 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

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
    if (!isLoggedIn) {
      const isConfirmed = await confirm({
        title: '로그인이 필요합니다',
        message: '지원하기 위해서는 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?',
        confirmText: '로그인',
        cancelText: '취소',
      });

      if (isConfirmed) {
        router.push('/login');
      }
      return;
    }
    setApplyOpen(true);
    setResumes([]);
    setCoverLetters([]);
    setSelectedResumeId(null);
    setSelectedCoverLetterId(null);
    setResumeError(null);
    setApplyError(null);

    try {
      setResumesLoading(true);
      const [resumeRes, clRes] = await Promise.all([
        api.get<ResumeDto[]>(`/applicant/resume/getMyResumes`),
        api.get<CoverLetterDto[]>(`/applicant/coverLetter/getMyCoverLetters`),
      ]);
      setResumes(resumeRes.data ?? []);
      setCoverLetters(clRes.data ?? []);
    } catch (e: any) {
      setResumeError(e?.message ?? '이력서/자소서를 불러오지 못했어요.');
    } finally {
      setResumesLoading(false);
    }
  };

  // ===================== 지원하기 =====================
  const submitApplication = async () => {
    if (!detail || !selectedResumeId) {
      setApplyError('이력서를 선택해야 합니다.');
      return;
    }
    try {
      setApplying(true);
      setApplyError(null);

      const payload: ApplicationDto = {
        jobPostingId: detail.jobPostingId,
        resumeId: selectedResumeId,
        coverLetterId: selectedCoverLetterId ?? undefined,
      };

      await api.post('/applicant/application/job-postings/apply', payload);

      notifySuccess(setSnackbar, '지원이 완료되었습니다');
      setApplyOpen(false); // 작성 다이얼로그 닫기
      setPreviewOpen(false); // 미리보기 닫기
    } catch (e: any) {
      notifyError(setSnackbar, e?.message ?? '지원 처리 중 오류가 발생했습니다.');
    } finally {
      setApplying(false);
    }
  };

  const canSeeEmployerActions =
    role === 'EMP' && !!employerId && !!detail && String(employerId) === String(detail.employerId);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
      {/* ===== 본문 + 우측 카드 ===== */}
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
            employerId={detail?.employerId}
            chips={chips}
            deadline={detail?.applicationDeadline ?? null}
            onApply={openApplyModal}
          />
        </Box>

        <Box sx={{ order: { xs: 1, lg: 0 } }}>
          <MainContent loading={loading} err={err} detail={detail} />
        </Box>
      </Box>

      {/* 기업 전용 버튼 */}
      {canSeeEmployerActions && (
        <MainButtonArea
          actions={[{ label: '이전', onClick: () => router.push('/job-postings') }]}
          saveAction={() => router.push(`/job-postings/edit?id=${detail?.jobPostingId}`)}
          saveLabel={'수정'}
        />
      )}

      {/* 지원하기 다이얼로그 */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>지원서 작성</DialogTitle>
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
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                이력서 선택
              </Typography>
              <List sx={{ py: 0, mb: 2 }}>
                {resumes.map(r => {
                  const selected = selectedResumeId === r.resumeId;
                  return (
                    <ListItemButton
                      key={r.resumeId}
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

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                자기소개서 선택
              </Typography>
              <List sx={{ py: 0 }}>
                {coverLetters.map(cl => {
                  const selected = selectedCoverLetterId === cl.coverLetterId;
                  return (
                    <ListItemButton
                      key={cl.coverLetterId}
                      onClick={() => setSelectedCoverLetterId(cl.coverLetterId!)}
                      selected={selected}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <Radio edge="start" checked={selected} tabIndex={-1} />
                      <ListItemText
                        primary={cl.coverLetterTitle}
                        secondary={
                          cl.updatedAt ? new Date(cl.updatedAt).toLocaleDateString() : undefined
                        }
                        primaryTypographyProps={{ noWrap: true }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>닫기</Button>
          <Button
            variant="outlined"
            disabled={!selectedResumeId}
            onClick={() => {
              setApplyOpen(false);
              setPreviewOpen(true);
            }}
          >
            미리보기
          </Button>
          <Button
            variant="contained"
            disabled={!selectedResumeId || applying}
            onClick={submitApplication}
          >
            {applying ? '지원 중...' : '지원하기'}
          </Button>
        </DialogActions>
        {applyError && (
          <Alert severity="error" sx={{ m: 2, mt: 0 }}>
            {applyError}
          </Alert>
        )}
      </Dialog>

      {/* 미리보기 다이얼로그 */}
      <ApplicationPreviewDialog
        open={previewOpen}
        resumeId={selectedResumeId}
        coverLetterId={selectedCoverLetterId}
        onClose={() => setPreviewOpen(false)}
        onApply={submitApplication}
        applying={applying}
      />

      {/*  Snackbar 알림 */}
      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => closeSnackbar(setSnackbar)}
        bottom="20px"
      />
    </Box>
  );
}

/* ====================== 본문 ====================== */
function MainContent({
  loading,
  err,
  detail,
}: {
  loading: boolean;
  err: string | null;
  detail: JobPostingResponse | null;
}) {
  const router = useRouter();
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

        <Tooltip title="기업정보 바로가기" arrow>
          <Typography
            variant="subtitle1"
            color="primary"
            gutterBottom
            sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            onClick={() => router.push(`/emp/profile?id=${encodeURIComponent(detail.employerId)}`)}
          >
            {detail.companyName}
          </Typography>
        </Tooltip>

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

/* ====================== 우측 카드 ====================== */
function RightStickyCard({
  loading,
  companyName,
  employerId,
  chips,
  deadline,
  onApply,
}: {
  loading: boolean;
  companyName?: string | null;
  employerId?: string;
  chips: string[];
  deadline: string | null;
  onApply: () => void;
}) {
  const router = useRouter();
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
            <Tooltip title="기업정보 바로가기" arrow>
              <Typography
                variant="h6"
                gutterBottom
                color="primary"
                sx={{ cursor: 'pointer', display: 'inline-flex' }}
                onClick={() => {
                  if (!employerId) return;
                  router.push(`/emp/profile?id=${encodeURIComponent(employerId)}`);
                }}
              >
                {companyName ?? '회사명'}
              </Typography>
            </Tooltip>

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
