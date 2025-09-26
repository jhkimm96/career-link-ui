'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Chip, Paper, Stack, Button, type AlertColor } from '@mui/material';
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
        {/* 상단 영역: 썸네일 + 정보 */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'center', md: 'flex-start' }}
        >
          {/* 왼쪽: 썸네일 */}
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

          {/* 오른쪽: 정보 영역 */}
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

            {/* 첨부파일 카드 */}
            {notice.attachmentUrl && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  📄
                  <Typography variant="body2" noWrap maxWidth={200}>
                    {decodeURIComponent(notice.attachmentUrl.split('_').pop() || '첨부파일')}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  component="a"
                  href={notice.attachmentUrl}
                  target="_blank"
                  download
                >
                  다운로드
                </Button>
              </Paper>
            )}
          </Stack>
        </Stack>

        {/* 본문 */}
        <Box mt={4}>
          <Box
            sx={{
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 2,
              minHeight: 200,
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(notice.content),
            }}
          />
        </Box>

        {/* ✅ 관리자 버튼 (복구) */}
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
