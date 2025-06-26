'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import api from '@/api/axios';

type ScrapItem = {
  jobPostingId: number;
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
};

export default function ScrapCardList() {
  const router = useRouter();
  const [items, setItems] = useState<ScrapItem[]>([]);
  const fetchScraps = async () => {
    const res = await api.get('/job/scrap/myScraps', { params: { page: 0, size: 10 } });

    // jobPosting 내부 데이터 꺼내서 평탄화
    const mapped: ScrapItem[] = (res.data ?? []).map((scrap: any) => {
      const jp = scrap.jobPosting ?? {};
      return {
        jobPostingId: jp.jobPostingId,
        title: jp.title,
        companyName: jp.companyName,
        companyLogoUrl: jp.companyLogoUrl ?? null,
        jobField: jp.jobFieldCode,
        location: jp.locationCode,
        employmentType: jp.employmentTypeCode,
        experience: jp.careerLevelCode,
        education: jp.educationLevelCode,
        salary: jp.salaryCode,
        deadline: jp.applicationDeadline,
      };
    });

    setItems(mapped);
  };

  useEffect(() => {
    void fetchScraps();
  }, []);

  const removeScrap = async (jobPostingId: number) => {
    await api.delete(`/job/scrap/removeScrap/${jobPostingId}`);
    setItems(prev => prev.filter(it => it.jobPostingId !== jobPostingId));
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, // 항상 작은 카드
        gap: 2,
      }}
    >
      {items.map(row => {
        const isOpenEnded = !row.deadline || row.deadline === '';
        return (
          <Card
            key={row.jobPostingId}
            sx={{
              borderRadius: 3,
              border: '1px solid #ddd',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            }}
            onClick={() => router.push(`/job-postings/detail?id=${row.jobPostingId}`)}
          >
            <CardHeader
              avatar={
                <Avatar
                  src={row.companyLogoUrl ?? undefined}
                  alt={row.companyName}
                  variant="rounded"
                >
                  {row.companyName?.[0] ?? 'C'}
                </Avatar>
              }
              title={
                <Tooltip title={row.title} arrow>
                  <Typography noWrap fontWeight={700}>
                    {row.title}
                  </Typography>
                </Tooltip>
              }
              subheader={row.companyName}
              action={
                <IconButton
                  aria-label="스크랩 해제"
                  onClick={e => {
                    e.stopPropagation();
                    removeScrap(row.jobPostingId);
                  }}
                >
                  <BookmarkIcon color="primary" />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {row.jobField && <Chip size="small" label={row.jobField} />}
                {row.location && <Chip size="small" label={row.location} />}
                {row.employmentType && <Chip size="small" label={row.employmentType} />}
                {row.experience && <Chip size="small" label={row.experience} />}
                {row.education && <Chip size="small" label={row.education} />}
                {row.salary && <Chip size="small" label={row.salary} />}
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Typography variant="body2" color={isOpenEnded ? 'success.main' : 'text.secondary'}>
                마감: {isOpenEnded ? '상시모집' : row.deadline}
              </Typography>
            </CardActions>
          </Card>
        );
      })}
    </Box>
  );
}
