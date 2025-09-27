'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  Button,
  type AlertColor,
  GlobalStyles,
} from '@mui/material';
import api from '@/api/axios';
import DOMPurify from 'dompurify';
import { useAuth } from '@/libs/authContext';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';
import { useConfirm } from '@/components/confirm';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';

interface NoticeDetailDto {
  noticeId: number;
  noticeType: string;
  title: string;
  content: string;
  viewCount: number;
  isTopFixed: string;
  isExposed: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string | null;
  attachmentUrl?: string | null;
}

export default function NoticeDetailPage() {
  const { role } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
  const noticeTypeMap = useCommonCodeMap('NOTICE', 'TYPE');
  const confirm = useConfirm();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      try {
        const res = await api.get(`/notice/getNotice/${id}`);
        setNotice(res.data);
        notifySuccess(setSnackbar, res.message);
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    };

    if (id) fetchNoticeDetail();
  }, [id]);

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: '삭제하시겠습니까?',
      message: '삭제된 공지사항은 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      destructive: true,
      intent: 'error',
    });

    if (isConfirmed) {
      try {
        await api.put(`/admin/notice/deleteNotice/${notice?.noticeId}`);
        router.push('/notice');
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    }
  };

  const handleClose = () => closeSnackbar(setSnackbar);

  if (!notice) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">공지사항을 불러올 수 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <PagesSectionLayout title="공지사항">
      <Paper sx={{ p: 4 }}>
        {/* 상단 정보 영역 */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'center', md: 'flex-start' }}
        >
          {notice.thumbnailUrl && (
            <Box
              component="img"
              src={notice.thumbnailUrl}
              alt="공지사항 썸네일"
              sx={{
                width: { xs: '100%', md: '320px' },
                height: { xs: 'auto', md: '220px' },
                borderRadius: 2,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          )}

          <Stack spacing={2} flex={1}>
            <Stack direction="row" spacing={1}>
              <Chip label={noticeTypeMap[notice.noticeType] || notice.noticeType} size="small" />
              {notice.isTopFixed === 'Y' && <Chip label="상단고정" size="small" color="warning" />}
            </Stack>

            <Typography variant="h5" fontWeight={600}>
              {notice.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              작성자: CareerLink / 조회수: {notice.viewCount}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              노출기간: {notice.startDate ?? '-'} ~ {notice.endDate ?? '무기한'}
            </Typography>
          </Stack>
        </Stack>

        {/* 본문 */}
        <Box mt={4}>
          <Box
            className="notice-content"
            sx={{
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 2,
              minHeight: 200,
              backgroundColor: 'white',
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(notice.content),
            }}
          />
        </Box>

        {/* 관리자 버튼 */}
        {role === 'ADMIN' && (
          <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
            <Button variant="outlined" onClick={() => router.push('/notice')}>
              목록
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push(`/notice/edit/${notice.noticeId}`)}
            >
              수정
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>
              삭제
            </Button>
          </Box>
        )}
        <GlobalStyles
          styles={{
            '.notice-content': {
              fontFamily: `'Noto Sans KR', sans-serif`,
              lineHeight: 1.7,
              color: '#333',
              fontSize: '1rem',
            },
            '.notice-content h1': {
              fontSize: '1.8rem',
              fontWeight: 700,
              borderBottom: '2px solid #eee',
              paddingBottom: '0.3em',
              margin: '1em 0 0.5em',
            },
            '.notice-content h2': {
              fontSize: '1.4rem',
              fontWeight: 600,
              margin: '1em 0 0.5em',
            },
            '.notice-content h3': {
              fontSize: '1.2rem',
              fontWeight: 600,
              margin: '0.8em 0 0.4em',
            },
            '.notice-content ul': {
              paddingLeft: '1.5rem',
              margin: '0.5em 0',
              listStyle: 'disc',
            },
            '.notice-content ol': {
              paddingLeft: '1.5rem',
              margin: '0.5em 0',
              listStyle: 'decimal',
            },
            '.notice-content li': {
              margin: '0.3em 0',
            },
            '.notice-content strong': {
              color: '#1976d2',
              fontWeight: 700,
            },
            '.notice-content blockquote': {
              borderLeft: '4px solid #1976d2',
              paddingLeft: '1em',
              margin: '1em 0',
              background: '#f9f9f9',
              borderRadius: '4px',
              color: '#555',
            },
            '.notice-content a': {
              color: '#1976d2',
              textDecoration: 'underline',
            },
            '.notice-content a:hover': {
              textDecoration: 'none',
              color: '#0d47a1',
            },
          }}
        />
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleClose}
          bottom="10px"
        />
      </Paper>
    </PagesSectionLayout>
  );
}
