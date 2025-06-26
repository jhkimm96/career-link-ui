'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertColor,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import NotificationSnackbar from '@/components/snackBar';
import api from '@/api/axios';
import { closeSnackbar, notifyError } from '@/api/apiNotify';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkIcon from '@mui/icons-material/Work';

interface NoticeDto {
  noticeId: number;
  noticeType: string;
  title: string;
  viewCount: number;
  isTopFixed: string;
  isExposed: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string | null;
}

export default function CommonNoticePage() {
  const router = useRouter();
  const { role } = useAuth(); // 관리자 구분
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const [notices, setNotices] = useState<NoticeDto[]>([]);
  const [noticeType, setNoticeType] = useState('');
  const [sortOrder, setSortOrder] = useState('LATEST');

  // 공통코드 매핑
  const noticeTypeMap = useCommonCodeMap('NOTICE', 'TYPE');
  const sortOrderMap = useCommonCodeMap('NOTICE', 'SORT_ORD');

  // 유형별 아이콘 매핑
  const noticeTypeIconMap: Record<string, React.ReactNode> = {
    GENERAL: <CampaignIcon fontSize="small" color="primary" />,
    SYSTEM: <SettingsIcon fontSize="small" color="action" />,
    RECRUIT: <WorkIcon fontSize="small" color="success" />,
  };

  //공지사항 조회
  const fetchNotices = useCallback(async () => {
    try {
      const res = await api.get('/notice/getNotices', {
        params: { page: 0, size: 20, noticeType, sort: sortOrder },
      });
      setNotices(res.data);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  }, [noticeType, sortOrder]);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  const handleClose = () => closeSnackbar(setSnackbar);

  // Chip 렌더링 함수
  const renderChips = (
    map: Record<string, string>,
    selected: string,
    setSelected: (v: string) => void,
    includeAll: boolean = false
  ) => (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {includeAll && (
        <Chip
          label="전체"
          color={selected === '' ? 'primary' : 'default'}
          variant={selected === '' ? 'filled' : 'outlined'}
          onClick={() => setSelected('')}
        />
      )}
      {Object.entries(map).map(([code, name]) => (
        <Chip
          key={code}
          label={name}
          color={selected === code ? 'primary' : 'default'}
          variant={selected === code ? 'filled' : 'outlined'}
          onClick={() => setSelected(code)}
        />
      ))}
    </Stack>
  );

  return (
    <PagesSectionLayout title="공지사항">
      <Box>
        {/* 검색조건 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            {/* 공지유형 */}
            {renderChips(noticeTypeMap, noticeType, setNoticeType, true)}
            <Box display="flex" justifyContent="flex-end">
              {/* 정렬순서 */}
              {renderChips(sortOrderMap, sortOrder, setSortOrder)}
            </Box>
          </Stack>
        </Paper>

        {/* 카드 리스트 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {notices.map(notice => (
            <Card
              key={notice.noticeId}
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 썸네일 이미지 (없으면 기본 이미지 백엔드에서 내려줌) */}
              {notice.thumbnailUrl && (
                <Box sx={{ width: '100%', height: 160, overflow: 'hidden' }}>
                  <img
                    src={notice.thumbnailUrl}
                    alt="공지사항 썸네일"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {noticeTypeIconMap[notice.noticeType]}
                    <Chip
                      label={noticeTypeMap[notice.noticeType] || notice.noticeType}
                      size="small"
                    />
                  </Stack>

                  {/* 관리자만 '상단고정' Chip 표시 */}
                  {role === 'ADMIN' && notice.isTopFixed === 'Y' && (
                    <Chip label="상단고정" size="small" color="warning" />
                  )}
                </Box>

                {/* 제목 */}
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {notice.title}
                </Typography>

                {/* 작성자 + 조회수 */}
                <Typography variant="body2" color="text.secondary" noWrap>
                  작성자: CareerLink / 📊 {notice.viewCount}회
                </Typography>

                {/* 노출기간 */}
                <Typography variant="caption" color="text.secondary">
                  📅 {notice.startDate ?? '-'} ~ {notice.endDate ?? '무기한'}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => router.push(`/notice/detail/${notice.noticeId}`)}
                >
                  상세보기
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* 알림 */}
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleClose}
          bottom="10px"
        />
      </Box>
    </PagesSectionLayout>
  );
}
