'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';

interface ResumeListDto {
  resumeId: number;
  title: string;
  isActive: string;
  createdAt: string;
}

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<ResumeListDto[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });
  const router = useRouter();

  // 목록 조회
  const fetchResumes = async () => {
    try {
      const res = await api.get('/applicant/resume/getMyResumes');
      setResumes(res.data);
      notifySuccess(setSnackbar, '이력서를 불러왔습니다.');
    } catch (err: any) {
      notifyError(setSnackbar, err.message || '이력서 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return (
    <PageSectionLayout
      title="이력서 목록"
      actions={
        <Button variant="contained" onClick={() => router.push('/mypage/applicant/resumes/new')}>
          새 이력서 작성
        </Button>
      }
    >
      <Stack spacing={2}>
        {resumes.map(resume => (
          <Card
            key={resume.resumeId}
            sx={{
              p: 2,
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
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" noWrap>
                  {resume.title}
                </Typography>
                <Chip
                  label={resume.isActive === 'Y' ? '활성' : '비활성'}
                  color={resume.isActive === 'Y' ? 'success' : 'default'}
                  size="small"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                생성일: {new Date(resume.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => router.push(`/mypage/applicant/resumes/detail/${resume.resumeId}`)}
              >
                상세보기
              </Button>
            </CardActions>
          </Card>
        ))}
        {resumes.length === 0 && (
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              등록된 이력서가 없습니다.
            </Typography>
          </Box>
        )}
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
        />
      </Stack>
    </PageSectionLayout>
  );
}
