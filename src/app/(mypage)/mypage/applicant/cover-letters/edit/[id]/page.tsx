'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CoverLetterForm from '@/components/form/applicant/coverLetterForm';
import { CoverLetterDto } from '@/types/applicant/coverLetter';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { notifySuccess, notifyError, closeSnackbar, notifyInfo } from '@/api/apiNotify';
import { Box, Button } from '@mui/material';
import { useConfirm } from '@/components/confirm';

export default function CoverLetterEditPage() {
  const confirm = useConfirm();
  const params = useParams();
  const coverLetterId = params.id as string;
  const router = useRouter();

  const [coverLetter, setCoverLetter] = useState<CoverLetterDto>({
    coverLetterTitle: '',
    isActive: 'Y',
    items: [],
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/applicant/coverLetter/getMyCoverLetter/${coverLetterId}`);
        setCoverLetter(res.data);
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    };
    fetchData();
  }, [coverLetterId]);

  // 저장
  const handleSave = async () => {
    if (!coverLetter.coverLetterTitle?.trim()) {
      notifyInfo(setSnackbar, '자소서 제목을 입력해주세요.');
      return;
    }
    if (!coverLetter.items || coverLetter.items.length === 0) {
      notifyInfo(setSnackbar, '최소 1개 이상의 항목을 추가해주세요.');
      return;
    }
    if (coverLetter.items.some(item => !item.title?.trim() || !item.content?.trim())) {
      notifyInfo(setSnackbar, '항목의 제목과 내용을 모두 입력해주세요.');
      return;
    }
    const isConfirmed = await confirm({
      title: '저장하시겠습니까?',
      message: '자기소개서 내용을 수정합니다.',
      confirmText: '저장',
      cancelText: '취소',
    });
    if (isConfirmed) {
      try {
        await api.put(`/applicant/coverLetter/updateCoverLetter/${coverLetterId}`, coverLetter);
        notifySuccess(setSnackbar, '자소서가 수정되었습니다.');
        router.push('/mypage/applicant/cover-letters');
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    }
  };

  return (
    <PageSectionLayout
      title="자기소개서 수정"
      actions={
        <Button variant="contained" onClick={handleSave}>
          저장
        </Button>
      }
    >
      <Box>
        <CoverLetterForm value={coverLetter} onChange={setCoverLetter} />
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
