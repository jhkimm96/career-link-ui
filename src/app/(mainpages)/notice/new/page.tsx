'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import NoticeForm, { NoticeFormData } from '@/components/form/noticeForm';
import { useS3Upload } from '@/hooks/useS3Upload';
import api from '@/api/axios';
import { closeSnackbar, notifyError, notifyInfo } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';
import { Box } from '@mui/material';

export default function NoticeCreatePage() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  const [form, setForm] = useState<NoticeFormData>({
    noticeId: 0,
    noticeType: '',
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    isTopFixed: 'N',
    isExposed: 'Y',
  });

  // 썸네일 업로드 (미리보기 포함)
  const {
    selectedFile: thumbnailFile,
    setFile: setThumbnailFile,
    previewUrl: thumbnailPreview,
  } = useS3Upload({ uploadType: 'NOTICE_FILE' });

  // 첨부파일 업로드
  const { selectedFile: attachmentFile, setFile: setAttachmentFile } = useS3Upload({
    uploadType: 'NOTICE_FILE',
  });

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

      if (thumbnailFile) formData.append('thumbnailFile', thumbnailFile);
      if (attachmentFile) formData.append('attachmentFile', attachmentFile);

      const res = await api.post('/admin/notice/saveNotice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push(`/notice/detail/${res.data}`);
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <PagesSectionLayout title="공지사항 등록">
      <Box>
        <NoticeForm
          form={form}
          setForm={setForm}
          thumbnailName={thumbnailFile?.name}
          thumbnailPreview={thumbnailPreview} // 미리보기 전달
          onThumbnailChange={file =>
            file ? setThumbnailFile(file) : setThumbnailFile(null as any)
          }
          attachmentName={attachmentFile?.name}
          onAttachmentChange={file =>
            file ? setAttachmentFile(file) : setAttachmentFile(null as any)
          }
          onSubmit={handleSubmit}
        />

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
          bottom="10px"
        />
      </Box>
    </PagesSectionLayout>
  );
}
