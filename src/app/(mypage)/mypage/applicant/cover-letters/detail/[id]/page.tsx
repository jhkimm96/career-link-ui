'use client';

import { Typography, Stack, Button, Card, CardContent, Chip, Divider, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api/axios';
import { CoverLetterDto } from '@/types/applicant/coverLetter';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import NotificationSnackbar from '@/components/snackBar';
import { notifyError, closeSnackbar } from '@/api/apiNotify';
import { useConfirm } from '@/components/confirm';

export default function CoverLetterDetailPage() {
  const params = useParams();
  const coverLetterId = params.id as string;
  const router = useRouter();
  const confirm = useConfirm();

  const [coverLetter, setCoverLetter] = useState<CoverLetterDto | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // 데이터 조회
  const fetchCoverLetter = async () => {
    try {
      const res = await api.get(`/applicant/coverLetter/getMyCoverLetter/${coverLetterId}`);
      setCoverLetter(res.data);
    } catch (err: any) {
      notifyError(setSnackbar, err.message || '자소서를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchCoverLetter();
  }, [coverLetterId]);

  // 삭제
  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: '삭제하시겠습니까?',
      message: '자소서를 삭제하면 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/applicant/coverLetter/deleteCoverLetter/${coverLetterId}`);
      router.push('/mypage/applicant/cover-letters');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <PageSectionLayout
      title="자기소개서 상세"
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => router.push(`/mypage/applicant/cover-letters/edit/${coverLetterId}`)}
          >
            수정
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            삭제
          </Button>
        </Stack>
      }
    >
      <Box>
        {coverLetter ? (
          <Box>
            {/* 그룹 제목 + 활성화 상태 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                {coverLetter.coverLetterTitle}
              </Typography>
              <Chip
                label={coverLetter.isActive === 'Y' ? '활성' : '비활성'}
                color={coverLetter.isActive === 'Y' ? 'success' : 'default'}
                size="small"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              생성일:{' '}
              {coverLetter.createdAt ? new Date(coverLetter.createdAt).toLocaleDateString() : '-'}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* 항목들 */}
            <Stack spacing={2}>
              {coverLetter.items?.map(item => (
                <Card key={item.itemId} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">
                      {item.content}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        ) : (
          <Box textAlign="center" py={10}>
            자소서를 불러올 수 없습니다.
          </Box>
        )}

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
          bottom="10px"
        />
      </Box>
    </PageSectionLayout>
  );
}
