'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import NoticeForm, { NoticeFormData } from '@/components/form/noticeForm';
import { useS3Upload } from '@/hooks/useS3Upload';
import api from '@/api/axios';
import { closeSnackbar, notifyError, notifyInfo } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';
import { Box } from '@mui/material';

export default function NoticeEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });
  const [form, setForm] = useState<NoticeFormData>({
    noticeId: Number(id),
    noticeType: '',
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    isTopFixed: 'N',
    isExposed: 'Y',
  });
  const [originalFileName, setOriginalFileName] = useState('');
  const { selectedFile, setFile } = useS3Upload({ uploadType: 'NOTICE_FILE' });
  type NoticeResponse = NoticeFormData & { fileName?: string };
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await api.get<NoticeResponse>(`/notice/getNotice/${id}`);
        const { fileName, ...rest } = res.data;
        setForm(rest as NoticeFormData);
        setOriginalFileName(fileName ?? '');
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    };
    fetchNotice();
  }, [id]);

  const handleSubmit = async () => {
    if (!form.noticeType) {
      notifyInfo(setSnackbar, '공지유형을 선택해주세요.');
      return;
    }
    if (!form.title.trim()) {
      notifyInfo(setSnackbar, '제목을 입력해주세요.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('dto', new Blob([JSON.stringify(form)], { type: 'application/json' }));
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.put(`/admin/saveNotice/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push(`/notice/detail/${res.data}`);
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  if (!form) return <div>불러오는 중...</div>;

  return (
    <PagesSectionLayout title="공지사항 수정">
      <Box>
        <NoticeForm
          form={form}
          setForm={setForm}
          fileName={selectedFile?.name ?? originalFileName}
          onFileChange={file => {
            if (file) setFile(file);
            else setFile(null as any);
          }}
          onSubmit={handleSubmit}
          isEdit
        />
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
        />
      </Box>
    </PagesSectionLayout>
  );
}
