'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import api from '@/api/axios';
import { ResumeDto } from '@/types/applicant/resume';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import { useConfirm } from '@/components/confirm';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';

export default function ResumeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();

  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  const graduateStatusMap = useCommonCodeMap('EDUCATION', 'GRADUATE_STATUS');
  const eduTypeMap = useCommonCodeMap('EDUCATION', 'EDU_TYPE');

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

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: '삭제하시겠습니까?',
      message: '이력서를 삭제하면 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/applicant/resume/deleteResume/${id}`);
      notifySuccess(setSnackbar, '이력서가 삭제되었습니다.');
      router.push('/mypage/applicant/resumes');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

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
    <PageSectionLayout
      title="이력서 상세"
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => router.push(`/mypage/applicant/resumes/edit/${id}`)}
          >
            수정
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            삭제
          </Button>
        </Stack>
      }
    >
      <Stack spacing={4}>
        {/* 기본 정보 */}
        <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {resume.title}
              </Typography>
              <Typography variant="body2">이름: 홍길동</Typography>
              <Typography variant="body2" color="text.secondary">
                이메일: test@naver.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                연락처: 010-0000-0000
              </Typography>
            </Box>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Avatar
                src="/c-logo.png"
                alt="프로필 사진"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Stack>
        </Card>

        {/* 학력 */}
        {resume.educations && resume.educations.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              학력
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={1.5}>
              {resume.educations.map((edu, idx) => (
                <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {edu.eduType ? (eduTypeMap[edu.eduType] ?? edu.eduType) : ''}
                        {edu.schoolName || edu.examName
                          ? ` - ${edu.schoolName || edu.examName}`
                          : ''}
                      </Typography>
                      {edu.eduType !== 'GED' && (
                        <Typography variant="body2" color="text.secondary">
                          {edu.startDate} ~ {edu.endDate}
                        </Typography>
                      )}
                    </Stack>
                    {edu.major && (
                      <Typography variant="body2" color="text.secondary">
                        전공: {edu.major}
                      </Typography>
                    )}
                    {edu.creditEarned && edu.totalCredit && (
                      <Typography variant="body2" color="text.secondary">
                        학점: {edu.creditEarned}/{edu.totalCredit}
                      </Typography>
                    )}
                    {edu.graduateStatus && (
                      <Chip
                        label={graduateStatusMap[edu.graduateStatus] ?? edu.graduateStatus}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* 경력 */}
        {resume.experiences && resume.experiences.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              경력
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={1.5}>
              {resume.experiences.map((exp, idx) => (
                <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {exp.companyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.startDate} ~ {exp.endDate || '현재'}
                      </Typography>
                    </Stack>
                    {exp.position && (
                      <Typography variant="body2" color="text.secondary">
                        직책: {exp.position}
                      </Typography>
                    )}
                    {exp.description && (
                      <Typography variant="body2" color="text.secondary">
                        {exp.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* 자격증 */}
        {resume.certifications && resume.certifications.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              자격증
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {resume.certifications.map((cert, idx) => (
                <Chip
                  key={idx}
                  label={`${cert.name} (${cert.issuingOrganization || ''})`}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* 스킬 */}
        {resume.skills && resume.skills.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              스킬
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {resume.skills.map((skill, idx) => (
                <Chip key={idx} label={`${skill.skillName} (${skill.proficiency})`} color="info" />
              ))}
            </Stack>
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
