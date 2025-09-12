'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import api from '@/api/axios';
import { ResumeFormDto } from '@/types/applicant/resume';
import ResumeForm from '@/components/form/applicant/resumeForm';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError } from '@/api/apiNotify';

export default function ResumeEditPage() {
  const { id } = useParams(); // URL에서 resumeId 추출
  const router = useRouter();

  const [resume, setResume] = useState<ResumeFormDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // ✅ 이력서 상세 조회
  const fetchResume = async () => {
    try {
      const res = await api.get(`/applicant/resume/getResume/${id}`);
      setResume(res.data);
    } catch (err: any) {
      notifyError(setSnackbar, err.message || '이력서를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!resume) {
    return (
      <Box textAlign="center" mt={4}>
        이력서를 불러올 수 없습니다.
      </Box>
    );
  }

  return (
    <>
      <ResumeForm
        url={`/applicant/resume/updateResume/${id}`} // ✅ PUT 요청
        initialData={resume}
        onSuccess={() => router.push(`/mypage/applicant/resumes/detail/${id}`)} // 저장 후 상세 페이지 이동
      />
      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => closeSnackbar(setSnackbar)}
      />
    </>
  );
}
