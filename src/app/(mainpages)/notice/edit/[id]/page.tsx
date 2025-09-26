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
import { useConfirm } from '@/components/confirm';

export default function NoticeEditPage() {
  const confirm = useConfirm();
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

  // 썸네일 업로드
  const {
    selectedFile: thumbnailFile,
    setFile: setThumbnailFile,
    previewUrl: thumbnailPreview,
  } = useS3Upload({ uploadType: 'NOTICE_FILE' });

  // 첨부파일 업로드
  const { selectedFile: attachmentFile, setFile: setAttachmentFile } = useS3Upload({
    uploadType: 'NOTICE_FILE',
  });

  // 원래 파일 이름 유지
  const [originalThumbnailName, setOriginalThumbnailName] = useState('');
  const [originalAttachmentName, setOriginalAttachmentName] = useState('');

  type NoticeResponse = NoticeFormData & {
    thumbnailUrl?: string;
    attachmentUrl?: string;
  };

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await api.get<NoticeResponse>(`/notice/getNotice/${id}`);
        const { thumbnailUrl, attachmentUrl, ...rest } = res.data;

        setForm(rest as NoticeFormData);
        setOriginalThumbnailName(thumbnailUrl ? (thumbnailUrl.split('/').pop() ?? '') : '');
        setOriginalAttachmentName(attachmentUrl ? (attachmentUrl.split('/').pop() ?? '') : '');
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    };
    if (id) fetchNotice();
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
    const isConfirmed = await confirm({
      title: '저장하시겠습니까?',
      message: '공지사항 정보를 저장합니다.',
      confirmText: '저장',
      cancelText: '취소',
    });
    if (isConfirmed) {
      try {
        const formData = new FormData();
        formData.append('dto', new Blob([JSON.stringify(form)], { type: 'application/json' }));

        if (thumbnailFile) formData.append('thumbnailFile', thumbnailFile);
        if (attachmentFile) formData.append('attachmentFile', attachmentFile);

        const res = await api.put(`/admin/notice/saveNotice/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        router.push(`/notice/detail/${res.data}`);
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    }
  };

  if (!form) return <div>불러오는 중...</div>;

  return (
    <PagesSectionLayout title="공지사항 수정">
      <Box>
        <NoticeForm
          form={form}
          setForm={setForm}
          thumbnailName={thumbnailFile?.name ?? originalThumbnailName}
          thumbnailPreview={thumbnailPreview}
          onThumbnailChange={file =>
            file ? setThumbnailFile(file) : setThumbnailFile(null as any)
          }
          attachmentName={attachmentFile?.name ?? originalAttachmentName}
          onAttachmentChange={file =>
            file ? setAttachmentFile(file) : setAttachmentFile(null as any)
          }
          onSubmit={handleSubmit}
          isEdit
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
