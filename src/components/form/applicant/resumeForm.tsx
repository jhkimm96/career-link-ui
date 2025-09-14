'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import { ResumeFormDto } from '@/types/applicant/resume';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifyInfo, notifySuccess } from '@/api/apiNotify';
import { useConfirm } from '@/components/confirm';
import api from '@/api/axios';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';

interface ResumeFormProps {
  url: string; // 저장 API
  initialData?: ResumeFormDto;
  onSuccess?: () => void;
}

export default function ResumeForm({ url, initialData, onSuccess }: ResumeFormProps) {
  const confirm = useConfirm();

  const [resume, setResume] = useState<ResumeFormDto>(
    initialData ?? {
      title: '',
      isActive: 'Y',
      educations: [],
      experiences: [],
      certifications: [],
      skills: [],
    }
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // 공통 핸들러
  const handleChange = (field: keyof ResumeFormDto, value: any) =>
    setResume(prev => ({ ...prev, [field]: value }));

  const handleListChange = (
    listName: keyof ResumeFormDto,
    idx: number,
    field: string,
    value: any
  ) => {
    setResume(prev => {
      const list = [...(prev[listName] as any[])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [listName]: list };
    });
  };

  const handleListAdd = (listName: keyof ResumeFormDto, emptyObj: any) =>
    setResume(prev => ({
      ...prev,
      [listName]: [...(prev[listName] as any[]), emptyObj],
    }));

  const handleListRemove = (listName: keyof ResumeFormDto, idx: number) =>
    setResume(prev => {
      const list = [...(prev[listName] as any[])];
      list.splice(idx, 1);
      return { ...prev, [listName]: list };
    });

  // 유효성 검사
  const validateResume = (resume: ResumeFormDto): string | null => {
    if (!resume.title?.trim()) return '이력서 제목을 입력해주세요.';

    // 학력
    for (const edu of resume.educations) {
      if (!edu.eduType) return '학력 구분을 선택해주세요.';

      if (edu.eduType === 'GED') {
        if (!edu.examName?.trim()) return '검정고시명을 입력해주세요.';
        if (!edu.examDate?.trim()) return '검정고시 응시일을 입력해주세요.';
      }

      if (edu.eduType === 'HS') {
        if (!edu.schoolName?.trim()) return '고등학교명을 입력해주세요.';
        if (!edu.startDate?.trim()) return '고등학교 입학일을 입력해주세요.';
        if (!edu.endDate?.trim()) return '고등학교 졸업일을 입력해주세요.';
        if (!edu.graduateStatus?.trim()) return '졸업 상태를 선택해주세요.';
      }

      if (['CC', 'UNI', 'GRAD_MA', 'GRAD_PHD'].includes(edu.eduType)) {
        if (!edu.schoolName?.trim()) return '학교명을 입력해주세요.';
        if (!edu.major?.trim()) return '전공을 입력해주세요.';
        if (!edu.startDate?.trim()) return '입학일을 입력해주세요.';
        if (!edu.endDate?.trim()) return '졸업일을 입력해주세요.';
        if (!edu.graduateStatus?.trim()) return '졸업 상태를 선택해주세요.';

        if (edu.creditEarned && !/^\d(\.\d{1,2})?$/.test(edu.creditEarned)) {
          return '취득 학점 형식이 올바르지 않습니다. (예: 3.25)';
        }
        if (edu.totalCredit && !/^\d(\.\d)?$/.test(edu.totalCredit)) {
          return '총 학점 형식이 올바르지 않습니다. (예: 3.5)';
        }
      }
    }

    // 경력
    for (const exp of resume.experiences) {
      if (!exp.companyName?.trim()) return '회사명을 입력해주세요.';
      if (!exp.startDate?.trim()) return '경력 시작일을 입력해주세요.';
      if (!exp.description?.trim()) return '업무내용을 입력해주세요.';
    }

    // 자격증
    for (const cert of resume.certifications) {
      if (!cert.name?.trim()) return '자격증명을 입력해주세요.';
      if (!cert.acquiredDate?.trim()) return '자격증 취득일을 입력해주세요.';
    }

    // 스킬
    for (const skill of resume.skills) {
      if (!skill.skillName?.trim()) return '스킬명을 입력해주세요.';
    }

    return null;
  };

  // 저장
  const handleSave = async () => {
    // 빈 항목 자동 제거
    const filteredResume: ResumeFormDto = {
      ...resume,
      educations: resume.educations
        .filter(e => e.eduType || e.schoolName || e.examName || e.major)
        .map(e => ({
          ...e,
          graduateStatus: e.graduateStatus?.trim() || undefined, // 빈 문자열 제거
        })),
      experiences: resume.experiences.filter(e => e.companyName || e.startDate || e.description),
      certifications: resume.certifications.filter(
        c => c.name || c.issuingOrganization || c.acquiredDate
      ),
      skills: resume.skills.filter(s => s.skillName),
    };

    const validateMsg = validateResume(filteredResume);
    if (validateMsg) {
      notifyInfo(setSnackbar, validateMsg);
      return;
    }

    const isConfirmed = await confirm({
      title: '저장하시겠습니까?',
      message: '이력서 정보를 저장합니다.',
      confirmText: '저장',
      cancelText: '취소',
    });
    if (isConfirmed) {
      try {
        const method = url.includes('/updateResume') ? 'put' : 'post';
        await api[method](url, filteredResume);
        notifySuccess(setSnackbar, '이력서가 저장되었습니다.');
        onSuccess?.();
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    }
  };

  return (
    <PageSectionLayout
      title="이력서 작성"
      actions={
        <Button variant="contained" size="small" onClick={handleSave}>
          {url.includes('/resumes/') ? '저장' : '등록'}
        </Button>
      }
    >
      <Box>
        <Stack spacing={3}>
          {/* 제목 + 활성화 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="이력서 제목"
              fullWidth
              value={resume.title}
              onChange={e => handleChange('title', e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={resume.isActive === 'Y'}
                  onChange={e => handleChange('isActive', e.target.checked ? 'Y' : 'N')}
                />
              }
              label="활성화"
              sx={{ whiteSpace: 'nowrap' }} // 줄바꿈 방지
            />
          </Stack>

          {/* 학력 */}
          <Box>
            <Typography variant="subtitle1">학력</Typography>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {resume.educations.map((edu, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
                  {/* 학력 구분 */}
                  <CommonSelectBox
                    size="medium"
                    label="학력 구분"
                    groupCode="EDUCATION"
                    parentCode="EDU_TYPE"
                    value={edu.eduType || ''}
                    onChange={v => handleListChange('educations', idx, 'eduType', v)}
                    sx={{ flex: '1 1 200px' }}
                  />

                  {/* GED (검정고시) */}
                  {edu.eduType === 'GED' && (
                    <>
                      <TextField
                        size="medium"
                        label="검정고시명"
                        value={edu.examName || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'examName', e.target.value)
                        }
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        size="medium"
                        type="date"
                        label="응시일"
                        value={edu.examDate || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'examDate', e.target.value)
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: '1 1 200px' }}
                      />
                    </>
                  )}

                  {/* HS (고등학교) */}
                  {edu.eduType === 'HS' && (
                    <>
                      <TextField
                        size="medium"
                        label="학교명"
                        value={edu.schoolName || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'schoolName', e.target.value)
                        }
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        size="medium"
                        type="date"
                        label="입학일"
                        value={edu.startDate || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'startDate', e.target.value)
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        size="medium"
                        type="date"
                        label="졸업일"
                        value={edu.endDate || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'endDate', e.target.value)
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: '1 1 200px' }}
                      />
                      <CommonSelectBox
                        size="medium"
                        label="졸업 상태"
                        groupCode="EDUCATION"
                        parentCode="GRADUATE_STATUS"
                        value={edu.graduateStatus || ''}
                        onChange={v => handleListChange('educations', idx, 'graduateStatus', v)}
                        sx={{ flex: '1 1 200px' }}
                      />
                    </>
                  )}

                  {/* CC, UNI, GRAD (대학 이상) */}
                  {['CC', 'UNI', 'GRAD_MA', 'GRAD_PHD'].includes(edu.eduType || '') && (
                    <>
                      <TextField
                        size="medium"
                        label="학교명"
                        value={edu.schoolName || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'schoolName', e.target.value)
                        }
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        size="medium"
                        label="전공"
                        value={edu.major || ''}
                        onChange={e => handleListChange('educations', idx, 'major', e.target.value)}
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        size="medium"
                        type="date"
                        label="입학일"
                        value={edu.startDate || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'startDate', e.target.value)
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        type="date"
                        label="졸업일"
                        value={edu.endDate || ''}
                        onChange={e =>
                          handleListChange('educations', idx, 'endDate', e.target.value)
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: '1 1 200px' }}
                      />
                      <CommonSelectBox
                        size="medium"
                        label="졸업 상태"
                        groupCode="EDUCATION"
                        parentCode="GRADUATE_STATUS"
                        value={edu.graduateStatus || ''}
                        onChange={v => handleListChange('educations', idx, 'graduateStatus', v)}
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        label="취득 학점"
                        value={edu.creditEarned || ''}
                        onChange={e => {
                          let raw = e.target.value.replace(/[^0-9]/g, ''); // 숫자만
                          if (!raw) {
                            handleListChange('educations', idx, 'creditEarned', '');
                            return;
                          }

                          // 앞자리는 한 자리만 허용, 그 뒤는 소수 둘째 자리까지
                          raw = raw.slice(0, 3); // 최대 3자리 (예: "335" -> 3.35)

                          if (raw.length === 1) {
                            // 아직 소수부 입력 안 됐을 때 → 그냥 "3"
                            handleListChange('educations', idx, 'creditEarned', raw);
                            return;
                          }

                          const intPart = raw.slice(0, 1);
                          const decimal = raw.slice(1);
                          const formatted = `${intPart}.${decimal}`;
                          handleListChange('educations', idx, 'creditEarned', formatted);
                        }}
                        sx={{ flex: '1 1 200px' }}
                      />
                      <TextField
                        label="총 학점"
                        type="number"
                        value={edu.totalCredit || ''}
                        onChange={e => {
                          let raw = e.target.value.replace(/[^0-9]/g, '');
                          if (!raw) {
                            handleListChange('educations', idx, 'totalCredit', '');
                            return;
                          }

                          // 앞자리는 한 자리만 허용, 그 뒤는 소수 첫째 자리까지
                          raw = raw.slice(0, 2); // 최대 2자리 (예: "35" -> 3.5)

                          if (raw.length === 1) {
                            // 아직 소수부 입력 안 됐을 때 → 그냥 "3"
                            handleListChange('educations', idx, 'totalCredit', raw);
                            return;
                          }

                          const intPart = raw.slice(0, 1);
                          const decimal = raw.slice(1);
                          const formatted = `${intPart}.${decimal}`;
                          handleListChange('educations', idx, 'totalCredit', formatted);
                        }}
                        sx={{ flex: '1 1 200px' }}
                      />
                    </>
                  )}

                  <IconButton onClick={() => handleListRemove('educations', idx)} color="error">
                    <DeleteOutline />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Button
              startIcon={<AddCircleOutline />}
              onClick={() =>
                handleListAdd('educations', {
                  eduType: '',
                  schoolName: '',
                  examName: '',
                  examDate: '',
                  major: '',
                  creditEarned: '',
                  totalCredit: '',
                  startDate: '',
                  endDate: '',
                  graduateStatus: '',
                })
              }
              sx={{ mt: 1 }}
            >
              학력 추가
            </Button>
          </Box>

          {/* 경력 */}
          <Box>
            <Typography variant="subtitle1">경력</Typography>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {resume.experiences.map((exp, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
                  <TextField
                    size="medium"
                    label="회사명"
                    value={exp.companyName}
                    onChange={e =>
                      handleListChange('experiences', idx, 'companyName', e.target.value)
                    }
                    sx={{ flex: '1 1 200px' }}
                  />
                  <TextField
                    size="medium"
                    label="직책"
                    value={exp.position || ''}
                    onChange={e => handleListChange('experiences', idx, 'position', e.target.value)}
                    sx={{ flex: '1 1 200px' }}
                  />
                  <TextField
                    size="medium"
                    type="date"
                    label="시작일"
                    value={exp.startDate || ''}
                    onChange={e =>
                      handleListChange('experiences', idx, 'startDate', e.target.value)
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: '1 1 200px' }}
                  />
                  <TextField
                    size="medium"
                    type="date"
                    label="종료일"
                    value={exp.endDate || ''}
                    onChange={e => handleListChange('experiences', idx, 'endDate', e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: '1 1 200px' }}
                  />
                  <TextField
                    size="medium"
                    label="업무내용"
                    multiline
                    rows={3}
                    value={exp.description || ''}
                    onChange={e =>
                      handleListChange('experiences', idx, 'description', e.target.value)
                    }
                    sx={{ flex: '1 1 100%' }}
                  />
                  <IconButton onClick={() => handleListRemove('experiences', idx)} color="error">
                    <DeleteOutline />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Button
              startIcon={<AddCircleOutline />}
              onClick={() =>
                handleListAdd('experiences', {
                  companyName: '',
                  position: '',
                  startDate: '',
                  endDate: '',
                  description: '',
                })
              }
              sx={{ mt: 1 }}
            >
              경력 추가
            </Button>
          </Box>

          {/* 자격증 */}
          <Box>
            <Typography variant="subtitle1">자격증</Typography>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {resume.certifications.map((cert, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
                  <TextField
                    label="자격증명"
                    value={cert.name}
                    onChange={e => handleListChange('certifications', idx, 'name', e.target.value)}
                  />
                  <TextField
                    label="발급기관"
                    value={cert.issuingOrganization || ''}
                    onChange={e =>
                      handleListChange('certifications', idx, 'issuingOrganization', e.target.value)
                    }
                  />
                  <TextField
                    type="date"
                    label="취득일"
                    value={cert.acquiredDate || ''}
                    onChange={e =>
                      handleListChange('certifications', idx, 'acquiredDate', e.target.value)
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <IconButton onClick={() => handleListRemove('certifications', idx)} color="error">
                    <DeleteOutline />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Button
              startIcon={<AddCircleOutline />}
              onClick={() =>
                handleListAdd('certifications', {
                  name: '',
                  issuingOrganization: '',
                  acquiredDate: '',
                })
              }
              sx={{ mt: 1 }}
            >
              자격증 추가
            </Button>
          </Box>

          {/* 스킬 */}
          <Box>
            <Typography variant="subtitle1">스킬</Typography>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {resume.skills.map((skill, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
                  <TextField
                    label="스킬명"
                    value={skill.skillName}
                    onChange={e => handleListChange('skills', idx, 'skillName', e.target.value)}
                  />
                  <TextField
                    label="숙련도"
                    value={skill.proficiency || ''}
                    onChange={e => handleListChange('skills', idx, 'proficiency', e.target.value)}
                  />
                  <IconButton onClick={() => handleListRemove('skills', idx)} color="error">
                    <DeleteOutline />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Button
              startIcon={<AddCircleOutline />}
              onClick={() =>
                handleListAdd('skills', {
                  skillName: '',
                  proficiency: '',
                })
              }
              sx={{ mt: 1 }}
            >
              스킬 추가
            </Button>
          </Box>
        </Stack>

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
        />
      </Box>
    </PageSectionLayout>
  );
}
