'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import api from '@/api/axios';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Divider,
  Stack,
  Skeleton,
  Avatar,
  Tooltip,
  IconButton,
  CardActionArea,
  Button,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';

const TOP_APPLIED_API = '/main/job-postings';
const FEATURED_EMPLOYERS_API = '/main/employers';

export type TopJob = {
  jobId: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  jobField?: string | null;
  location?: string | null;
  employmentType?: string | null;
  experience?: string | null;
  education?: string | null;
  salary?: string | null;
  deadline?: string | null;
  appCount: number;
};

export type EmployerMini = {
  employerId: string;
  companyName: string;
  companyLogoUrl?: string | null;
  postingCount?: number | null;
};

async function fetchTopApplied(limit = 12, signal?: AbortSignal): Promise<TopJob[]> {
  const { data } = await api.get<{ items: any[] }>(TOP_APPLIED_API, {
    params: { limit },
    signal,
  });
  return data?.items ?? [];
}

async function fetchFeaturedEmployers(limit = 30, signal?: AbortSignal): Promise<EmployerMini[]> {
  const { data } = await api.get<{ items: EmployerMini[] }>(FEATURED_EMPLOYERS_API, {
    params: { limit },
    signal,
  });
  return data.items ?? [];
}

const getInitial = (name?: string | null) => (name && name[0]) || 'C';

const formatDeadline = (d?: string | null) => {
  if (!d) return '상시모집';
  return dayjs(d).isValid() ? dayjs(d).format('YYYY.MM.DD') : d;
};

const dday = (d?: string | null) => {
  if (!d || !dayjs(d).isValid()) return null;
  const today = dayjs().startOf('day');
  const target = dayjs(d).startOf('day');
  return target.diff(today, 'day');
};

function JobCard({
  row,
  isBookmarked,
  onToggleBookmark,
  onOpen,
}: {
  row: TopJob;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: number) => void;
  onOpen: (jobId: number) => void;
}) {
  const leftDays = dday(row.deadline);
  const isOpenEnded = !row.deadline;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardActionArea
        component="div"
        onClick={() => onOpen(row.jobId)}
        sx={{ borderRadius: 'inherit', height: '100%' }}
      >
        <CardHeader
          avatar={
            <Avatar
              alt={row.companyName}
              src={row.companyLogoUrl ?? undefined}
              variant="rounded"
              sx={{ width: 40, height: 40, bgcolor: 'grey.100', fontSize: 14, fontWeight: 700 }}
              imgProps={{ loading: 'lazy' }}
            >
              {getInitial(row.companyName)}
            </Avatar>
          }
          title={
            <Tooltip title={row.title} arrow disableInteractive>
              <Typography
                variant="h6"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  lineHeight: 1.25,
                }}
              >
                {row.title}
              </Typography>
            </Tooltip>
          }
          subheader={row.companyName}
          action={
            <IconButton
              size="small"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onToggleBookmark(row.jobId);
              }}
              aria-label={isBookmarked ? '북마크 해제' : '북마크'}
            >
              {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
            </IconButton>
          }
        />

        <Divider sx={{ borderColor: 'transparent' }} />

        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {row.jobField && (
                <Chip
                  size="small"
                  label={row.jobField}
                  sx={{
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: 'action.hover',
                    '& .MuiChip-label': { px: 1.2 },
                  }}
                />
              )}
              {row.location && (
                <Chip
                  size="small"
                  label={row.location}
                  sx={{
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: 'action.hover',
                    '& .MuiChip-label': { px: 1.2 },
                  }}
                />
              )}
              {row.employmentType && (
                <Chip
                  size="small"
                  label={row.employmentType}
                  sx={{
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: 'action.hover',
                    '& .MuiChip-label': { px: 1.2 },
                  }}
                />
              )}
              {row.experience && (
                <Chip
                  size="small"
                  label={row.experience}
                  sx={{
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: 'action.hover',
                    '& .MuiChip-label': { px: 1.2 },
                  }}
                />
              )}
              {row.education && (
                <Chip
                  size="small"
                  label={row.education}
                  sx={{
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: 'action.hover',
                    '& .MuiChip-label': { px: 1.2 },
                  }}
                />
              )}
              {row.salary && (
                <Chip
                  size="small"
                  label={row.salary}
                  sx={{
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: 'action.hover',
                    '& .MuiChip-label': { px: 1.2 },
                  }}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: 'transparent' }} />

        <CardActions sx={{ justifyContent: 'space-between', minHeight: 48, px: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: isOpenEnded ? 'success.main' : 'text.secondary' }}
          >
            마감: {isOpenEnded ? '상시모집' : formatDeadline(row.deadline)}
          </Typography>
          <Typography>
            지원 {row.appCount}명{leftDays != null && leftDays >= 0 ? ` · D-${leftDays}` : ''}
          </Typography>
        </CardActions>
      </CardActionArea>
    </Card>
  );
}

function EmployerCard({
  emp,
  onOpen,
}: {
  emp: EmployerMini;
  onOpen: (employerId: string) => void;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.10)',
        },
      }}
    >
      <CardActionArea
        component="div"
        onClick={() => onOpen(emp.employerId)}
        sx={{ borderRadius: 'inherit', height: '100%' }}
      >
        <CardHeader
          avatar={
            <Avatar
              alt={emp.companyName}
              src={emp.companyLogoUrl ?? undefined}
              variant="rounded"
              sx={{ width: 44, height: 55, bgcolor: 'grey.100', fontSize: 14, fontWeight: 700 }}
              imgProps={{ loading: 'lazy' }}
            >
              {getInitial(emp.companyName)}
            </Avatar>
          }
          title={
            <Tooltip title={emp.companyName} arrow disableInteractive>
              <Typography
                variant="subtitle1"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  lineHeight: 1.25,
                  fontWeight: 700,
                }}
              >
                {emp.companyName}
              </Typography>
            </Tooltip>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <Chip
            size="small"
            label={`채용중 ${emp.postingCount ?? 0}건`}
            sx={{
              height: 24,
              borderRadius: '999px',
              bgcolor: 'action.hover',
              '& .MuiChip-label': { px: 1.2 },
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function MainTopSections() {
  const router = useRouter();

  const [topJobs, setTopJobs] = useState<TopJob[] | null>(null);
  const [empList, setEmpList] = useState<EmployerMini[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  const toggleBookmark = (jobId: number) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const openJob = useCallback(
    (jobId: number) => {
      router.push(`/job-postings/detail?id=${jobId}`);
    },
    [router]
  );

  const openEmployer = useCallback(
    (employerId: string) => {
      router.push(`/emp/profile?id=${encodeURIComponent(employerId)}`);
    },
    [router]
  );

  useEffect(() => {
    const ac = new AbortController();
    setError(null);

    (async () => {
      try {
        const [jobs, emps] = await Promise.all([
          fetchTopApplied(12, ac.signal),
          fetchFeaturedEmployers(30, ac.signal),
        ]);
        setTopJobs(jobs);
        setEmpList(emps);
      } catch (e: any) {
        if (
          e?.message !== 'canceled' &&
          e?.name !== 'CanceledError' &&
          e?.code !== 'ERR_CANCELED'
        ) {
          setError('메인 데이터 로드 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
        }
      }
    })();

    return () => ac.abort();
  }, []);

  return (
    <Box>
      {/* TOP 12: 지원자 수 많은 공고 */}
      <Box sx={{ mb: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              TOP 12
            </Typography>
            <Chip
              label="HOT"
              size="small"
              sx={{
                height: 22,
                borderRadius: '999px',
                bgcolor: '#FFF0F5',
                color: '#D81B60',
                '& .MuiChip-label': { px: 1, fontWeight: 700 },
              }}
            />
          </Stack>
          <Button size="small" onClick={() => router.push('/job-postings')}>
            전체 보기
          </Button>
        </Stack>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          지금 지원이 가장 많은 공고
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {topJobs ? (
            topJobs.length > 0 ? (
              topJobs.map(row => (
                <JobCard
                  key={row.jobId}
                  row={row}
                  isBookmarked={bookmarks.has(row.jobId)}
                  onToggleBookmark={toggleBookmark}
                  onOpen={openJob}
                />
              ))
            ) : (
              <Typography color="text.secondary">표시할 공고가 없습니다.</Typography>
            )
          ) : null}
        </Box>
      </Box>

      {/* 기업정보 바로가기 */}
      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              기업정보 바로가기!
            </Typography>
          </Stack>
        </Stack>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          관심 기업을 눌러 채용중 공고를 확인해보세요
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
          }}
        >
          {empList ? (
            empList.length > 0 ? (
              empList
                .slice(0, 30)
                .map(emp => <EmployerCard key={emp.employerId} emp={emp} onOpen={openEmployer} />)
            ) : (
              <Typography color="text.secondary">표시할 기업이 없습니다.</Typography>
            )
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
