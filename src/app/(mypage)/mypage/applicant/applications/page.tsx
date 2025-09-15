'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CardActions,
} from '@mui/material';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import NotificationSnackbar from '@/components/snackBar';
import { notifyError, notifySuccess, closeSnackbar } from '@/api/apiNotify';
import api from '@/api/axios';

type ApplicationListItem = {
  applicationId: number;
  jobTitle: string;
  companyName: string;
  status: string;
  appliedAt: string;
  resumeTitle: string;
  applicationDeadline: string | null;
};

type Period = '3M' | '6M' | '1Y' | 'ALL';

export default function ApplicationListPage() {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [period, setPeriod] = useState<Period>('3M'); // ✅ 기본 3개월

  const observerRef = useRef<HTMLDivElement | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // ✅ 상태별 칩 색상
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Chip label="제출 완료" color="info" size="small" />;
      case 'UNDER_REVIEW':
        return <Chip label="검토 중" color="primary" size="small" />;
      case 'PASSED':
        return <Chip label="합격" color="success" size="small" />;
      case 'FAILED':
        return <Chip label="불합격" color="error" size="small" />;
      case 'CANCELLED':
        return <Chip label="취소" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // ✅ 데이터 조회
  const fetchData = useCallback(
    async (reset = false) => {
      try {
        const res = await api.get('/applicant/job-postings/getMyApplications', {
          params: { period, page, size: 6 },
        });

        const data: ApplicationListItem[] = res.data ?? [];
        const pageInfo = res.pagination;

        if (reset) {
          setApplications(data); // 초기화 모드
        } else {
          setApplications(prev => [...prev, ...data]); // 무한스크롤 append
        }

        setHasMore(pageInfo?.hasNext ?? false);
      } catch (e: any) {
        notifyError(setSnackbar, e.message);
      }
    },
    [period, page]
  );

  // ✅ 조회조건 바뀔 때 초기화
  useEffect(() => {
    setApplications([]);
    setHasMore(true);
    setPage(0); // → page가 바뀌면 아래 useEffect에서 fetchData 실행됨
  }, [period]);

  // ✅ page 변경될 때 데이터 로딩
  useEffect(() => {
    fetchData(page === 0); // page=0이면 reset 모드로
  }, [page, fetchData]);

  // ✅ 스크롤 감시
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1); // 스크롤 도달 시 페이지 증가
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  // 지원 취소
  const handleCancel = async (applicationId: number) => {
    try {
      await api.put(`/applicant/job-postings/cancel/${applicationId}`);
      notifySuccess(setSnackbar, '지원이 취소되었습니다.');
      setApplications(prev =>
        prev.map(app =>
          app.applicationId === applicationId ? { ...app, status: 'CANCELLED' } : app
        )
      );
    } catch (e: any) {
      if (e.response?.data?.message === '기업에서 진행 중인 지원은 취소할 수 없습니다.') {
        notifyError(setSnackbar, '기업에서 진행 중인 지원은 취소할 수 없습니다.');
      } else {
        notifyError(setSnackbar, e.message);
      }
    }
  };

  // 다시 지원하기
  const handleReapply = async (applicationId: number) => {
    try {
      await api.post(`/applicant/job-postings/reapply/${applicationId}`);
      notifySuccess(setSnackbar, '다시 지원이 완료되었습니다.');
      setApplications(prev =>
        prev.map(app =>
          app.applicationId === applicationId
            ? { ...app, status: 'SUBMITTED', appliedAt: new Date().toISOString() }
            : app
        )
      );
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  const handleCloseSnackbar = () => closeSnackbar(setSnackbar);

  return (
    <PageSectionLayout
      title="지원현황"
      actions={
        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="period-label">조회기간</InputLabel>
            <Select
              labelId="period-label"
              value={period}
              onChange={e => setPeriod(e.target.value as Period)}
              label="조회기간"
            >
              <MenuItem value="3M">최근 3개월</MenuItem>
              <MenuItem value="6M">최근 6개월</MenuItem>
              <MenuItem value="1Y">최근 1년</MenuItem>
              <MenuItem value="ALL">전체</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      }
    >
      {/* ✅ 2열 카드 레이아웃 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {applications.map(app => {
          const deadlinePassed =
            !!app.applicationDeadline && new Date(app.applicationDeadline) < new Date();

          return (
            <Card
              key={app.applicationId}
              sx={{
                p: 2,
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #ddd',
                boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                transition: 'transform .2s ease, box-shadow .2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" noWrap>
                    {app.jobTitle}
                  </Typography>
                  {getStatusChip(app.status)}
                </Stack>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {app.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  지원일: {app.appliedAt}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  제출 이력서: {app.resumeTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  마감일: {app.applicationDeadline || '제한 없음'}
                </Typography>
              </CardContent>

              <CardActions sx={{ mt: 'auto' }}>
                {app.status === 'CANCELLED' ? (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={deadlinePassed}
                    onClick={() => handleReapply(app.applicationId)}
                  >
                    다시 지원하기
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={app.status !== 'SUBMITTED'}
                    onClick={() => handleCancel(app.applicationId)}
                  >
                    지원취소하기
                  </Button>
                )}
              </CardActions>
            </Card>
          );
        })}

        {applications.length === 0 && (
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              지원 내역이 없습니다.
            </Typography>
          </Box>
        )}

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          bottom="10px"
        />
        {/* ✅ 무한스크롤 트리거 */}
        <div ref={observerRef} style={{ height: 1 }} />
      </Box>
    </PageSectionLayout>
  );
}
