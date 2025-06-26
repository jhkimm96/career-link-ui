'use client';

import { Typography, Stack, Button, Card, CardContent, Chip, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import { CoverLetterDto } from '@/types/applicant/coverLetter';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import NotificationSnackbar from '@/components/snackBar';
import { notifyError, closeSnackbar, notifySuccess } from '@/api/apiNotify';

export default function CoverLetterListPage() {
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState<CoverLetterDto[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  const fetchCoverLetters = async () => {
    try {
      const res = await api.get('/applicant/coverLetter/getMyCoverLetters');
      setCoverLetters(res.data);
      notifySuccess(setSnackbar, '자소서를 불러왔습니다.');
    } catch (err: any) {
      notifyError(setSnackbar, err.message || '자소서를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  return (
    <PageSectionLayout
      title="자기소개서 관리"
      actions={
        <Button
          variant="contained"
          onClick={() => router.push('/mypage/applicant/cover-letters/new')}
        >
          새 자소서 등록
        </Button>
      }
    >
      <Stack spacing={2}>
        {coverLetters.map(letter => (
          <Card
            key={letter.coverLetterId}
            sx={{
              borderRadius: 2,
              border: '1px solid #eee',
              transition: 'all .2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              },
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                {/* 왼쪽: 제목 + 생성일 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {letter.coverLetterTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    생성일:{' '}
                    {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : '-'}
                  </Typography>
                </Box>

                {/* 상태 */}
                <Chip
                  label={letter.isActive === 'Y' ? '활성' : '비활성'}
                  color={letter.isActive === 'Y' ? 'success' : 'default'}
                  size="small"
                  sx={{ mr: 2 }}
                />

                {/* 상세보기 버튼 */}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    router.push(`/mypage/applicant/cover-letters/detail/${letter.coverLetterId}`)
                  }
                >
                  상세보기
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {coverLetters.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" mt={4}>
            등록된 자기소개서가 없습니다.
          </Typography>
        )}

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
          bottom="10px"
        />
      </Stack>
    </PageSectionLayout>
  );
}
