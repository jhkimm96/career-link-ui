'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
  Typography,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Chip,
  Avatar,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { ResumeDto } from '@/types/applicant/resume';
import { CoverLetterDto } from '@/types/applicant/coverLetter';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';

type Props = {
  open: boolean;
  resumeId: number | null;
  coverLetterId: number | null;
  onClose: () => void;
  onApply: () => void;
  applying?: boolean;
};

export default function ApplicationPreviewDialog({
  open,
  resumeId,
  coverLetterId,
  onClose,
  onApply,
  applying = false,
}: Props) {
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterDto | null>(null);
  const [loading, setLoading] = useState(false);

  const graduateStatusMap = useCommonCodeMap('EDUCATION', 'GRADUATE_STATUS');
  const eduTypeMap = useCommonCodeMap('EDUCATION', 'EDU_TYPE');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        if (resumeId) {
          const res = await api.get(`/applicant/resume/getResume/${resumeId}`);
          setResume(res.data);
        } else {
          setResume(null);
        }
        if (coverLetterId) {
          const cl = await api.get(`/applicant/coverLetter/getMyCoverLetter/${coverLetterId}`);
          setCoverLetter(cl.data);
        } else {
          setCoverLetter(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [open, resumeId, coverLetterId]);

  // 안전한 배열 참조
  const educations = resume?.educations ?? [];
  const experiences = resume?.experiences ?? [];
  const certifications = resume?.certifications ?? [];
  const skills = resume?.skills ?? [];
  const clItems = coverLetter?.items ?? [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>지원서 미리보기</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* ========== 이력서 ========== */}
            {resume && (
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  이력서
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* 기본 정보 */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Stack
                    direction="row"
                    spacing={3}
                    justifyContent="space-between"
                    alignItems="center"
                  >
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
                    <Avatar
                      src="/c-logo.png"
                      alt="프로필 사진"
                      sx={{ width: 100, height: 100, borderRadius: 2 }}
                    />
                  </Stack>
                </Card>

                {/* 학력 */}
                {educations.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      학력
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />
                    <Stack spacing={1.5}>
                      {educations.map((edu, idx) => (
                        <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="subtitle2" fontWeight={600}>
                                {(edu.eduType && (eduTypeMap[edu.eduType] ?? edu.eduType)) || ''}
                                {edu.schoolName ? ` - ${edu.schoolName}` : ''}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(edu.startDate || '') + (edu.endDate ? ` ~ ${edu.endDate}` : '')}
                              </Typography>
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
                {experiences.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      경력
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />
                    <Stack spacing={1.5}>
                      {experiences.map((exp, idx) => (
                        <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="subtitle2" fontWeight={600}>
                                {exp.companyName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(exp.startDate || '') +
                                  (exp.endDate ? ` ~ ${exp.endDate}` : ' ~ 현재')}
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
                {certifications.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      자격증
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {certifications.map((cert, idx) => (
                        <Chip
                          key={idx}
                          label={`${cert.name ?? ''}${cert.issuingOrganization ? ` (${cert.issuingOrganization})` : ''}`}
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* 스킬 */}
                {skills.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      스킬
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={`${skill.skillName ?? ''}${skill.proficiency ? ` (${skill.proficiency})` : ''}`}
                          color="info"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}

            {/* ========== 자기소개서 ========== */}
            {coverLetter ? (
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  자기소개서
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {clItems.map(item => (
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
              <Typography variant="body2" color="text.secondary">
                자기소개서는 선택하지 않았습니다.
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button variant="contained" onClick={onApply} disabled={applying || !resume}>
          {applying ? '지원 중...' : '지원하기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
