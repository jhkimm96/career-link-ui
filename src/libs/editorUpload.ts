import api from '@/api/axios';

export async function imageApi(
  file: File,
  uploadType: 'JOB_POSTING' | 'PROFILE_IMAGE' = 'JOB_POSTING'
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('uploadType', uploadType);

  const res = await api.post('/s3/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const url = (res.data?.body ?? res.data?.url ?? res.data) as string;
  if (!url || typeof url !== 'string') throw new Error('업로드 응답에 URL이 없습니다.');
  return url;
}
