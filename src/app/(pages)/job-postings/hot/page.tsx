'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Fab,
  CardActionArea,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';

type HotItem = {
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
  viewCount: number;
};

type HotResponse = {
  items: HotItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

async function fetchHot(params: {
  limit?: number;
  cursor?: string | null;
  signal?: AbortSignal;
}): Promise<HotResponse> {
  const { signal, limit, cursor } = params ?? {};
  const q: Record<string, any> = {};
  if (typeof limit === 'number') q.limit = limit;
  if (cursor != null && cursor !== '') q.cursor = cursor;

  const res = await api.get<HotResponse>('/job/job-postings/hot', { params: q, signal });
  return res.data;
}

export default function HotPage() {
  const router = useRouter();
  const { role, isLoggedIn } = useAuth();
  const isEmp = role === 'EMP';

  const [items, setItems] = useState<HotItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [ioEnabled, setIoEnabled] = useState(false);
  const dedupe = useRef<Set<number>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const toggleBookmark = (jobId: number) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const cursorRef = useRef<string | null>(null);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  const isCanceledError = (e: any) =>
    e?.code === 'ERR_CANCELED' ||
    e?.name === 'CanceledError' ||
    e?.message === 'canceled' ||
    e?.cause?.name === 'AbortError';

  useEffect(() => {
    let canceled = false;

    if (!mountedRef.current) return;
    setLoading(true);

    fetchHot({ limit: 16 })
      .then(res => {
        if (canceled || !mountedRef.current) return;

        const next: HotItem[] = [];
        for (const it of res.items) {
          if (!dedupe.current.has(it.jobId)) {
            dedupe.current.add(it.jobId);
            next.push(it);
          }
        }

        setItems(next);
        setCursor(res.nextCursor);
        setHasMore(res.hasMore && next.length > 0);
        setIoEnabled(true);
      })
      .catch((e: any) => {
        console.error(e);
      })
      .finally(() => {
        if (!canceled && mountedRef.current) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    if (abortRef.current && !abortRef.current.signal.aborted) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;

    if (mountedRef.current) {
      setLoading(true);
    }

    try {
      const res = await fetchHot({
        limit: 16,
        ...(cursorRef.current ? { cursor: cursorRef.current } : {}),
        signal: ac.signal,
      });

      if (!mountedRef.current) return;

      const next: HotItem[] = [];
      for (const it of res.items) {
        if (!dedupe.current.has(it.jobId)) {
          dedupe.current.add(it.jobId);
          next.push(it);
        }
      }

      setItems(prev => prev.concat(next));
      setCursor(res.nextCursor);
      setHasMore(res.hasMore && next.length > 0);
    } catch (e: any) {
      if (!isCanceledError(e) && mountedRef.current) {
        console.error(e);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ioEnabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
            io.unobserve(el);
            Promise.resolve(loadMore()).finally(() => {
              if (document.body.contains(el)) io.observe(el);
            });
          }
        }
      },
      { rootMargin: '200px 0px 200px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ioEnabled, loadMore]);

  const skeletons = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => (
        <Card key={`s-${i}`} sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
          <CardHeader
            title={<Skeleton variant="text" width="70%" />}
            subheader={<Skeleton variant="text" width="40%" />}
          />
          <Divider />
          <CardContent>
            <Stack spacing={1.2}>
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rounded" height={24} />
            </Stack>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Skeleton variant="rounded" width={90} height={32} />
          </CardActions>
        </Card>
      )),
    []
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        HOT 100
      </Typography>
      <Typography sx={{ mb: 2 }} color="text.secondary">
        지금 가장 많이 본 공고
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {items.map(row => {
          const isOpenEnded = !row.deadline || row.deadline === '';
          const isBookmarked = bookmarks.has(row.jobId);

          return (
            <Card
              key={row.jobId}
              sx={{
                height: '100%',
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
              <CardActionArea
                component="div"
                onClick={() => router.push(`/job-postings/detail?id=${row.jobId}`)}
                disableRipple
                sx={{ borderRadius: 'inherit', height: '100%', alignSelf: 'stretch' }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      alt={row.companyName}
                      src={row.companyLogoUrl ?? undefined}
                      variant="rounded"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'grey.100',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                      imgProps={{ loading: 'lazy' }}
                    >
                      {row.companyName?.[0] ?? 'C'}
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
                    isLoggedIn && (
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleBookmark(row.jobId);
                        }}
                        aria-label={isBookmarked ? '북마크 해제' : '북마크'}
                      >
                        {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                      </IconButton>
                    )
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
                            border: 'none',
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
                            border: 'none',
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
                            border: 'none',
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
                            border: 'none',
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
                            border: 'none',
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
                            border: 'none',
                            bgcolor: 'action.hover',
                            '& .MuiChip-label': { px: 1.2 },
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </CardContent>

                <Divider sx={{ borderColor: 'transparent' }} />

                <CardActions sx={{ justifyContent: 'flex-start', minHeight: 48 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: isOpenEnded ? 'success.main' : 'text.secondary' }}
                  >
                    마감: {isOpenEnded ? '상시모집' : row.deadline}
                  </Typography>
                </CardActions>
              </CardActionArea>
            </Card>
          );
        })}

        {loading && skeletons}
      </Box>

      {/* 무한 스크롤 센티넬 */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* 기업회원 전용 등록 FAB */}
      {isEmp && (
        <Fab
          color="primary"
          aria-label="공고등록"
          onClick={() => router.push('/job-postings/form')}
          sx={{ position: 'fixed', right: 24, bottom: 80, zIndex: 1500 }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
