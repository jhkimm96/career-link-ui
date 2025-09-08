'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, Switch, TextField, FormControlLabel } from '@mui/material';
import DOMPurify from 'dompurify';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import RichTextEditor from '@/components/richTextEditor';
import MainButtonArea from '@/components/mainBtn/mainButtonArea';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import * as React from 'react';
import api from '@/api/axios';

type CodeItem = {
  code: string;
  name: string;
  parentCode: string | null;
  sortOrder?: number;
  level?: number;
};

type JobPostingForm = {
  title: string;
  descriptionHtml: string;
  jobFieldCode: string;
  jobFieldParentCode: string;
  locationCode: string;
  employmentTypeCode: string;
  educationLevelCode: string;
  careerLevelCode: string;
  salaryCode: string;
  applicationDeadline: Dayjs | null;
  isSkillsnap: boolean;
  isActive: boolean;
};

const GROUPS = {
  JOB_FIELD: 'JOB_FIELD',
  LOCATION: 'LOCATION',
  EMPLOYMENT_TYPE: 'EMPLOYMENT_TYPE',
  EDUCATION_LEVEL: 'EDUCATION_LEVEL',
  CAREER_LEVEL: 'CAREER_LEVEL',
  SALARY: 'SALARY',
} as const;

// 계층형 직군/직무 트리
async function fetchJobFieldTree() {
  const res = await api.get('/common/common-codes', { params: { group: GROUPS.JOB_FIELD } });
  const data = res.data;
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return items
    .map((it: any) => ({
      code: it.code,
      name: it.codeName,
      parentCode: it.parentCode ?? null,
      sortOrder: it.sortOrder,
      level: it.level,
    }))
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

async function fetchFlatOptions(group: string) {
  const res = await api.get('/common/common-codes', { params: { group } });
  const data = res.data;
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return items
    .map((it: any) => ({ code: it.code, name: it.codeName, sortOrder: it.sortOrder }))
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export default function JobPostingCreateForm() {
  // snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'info' | 'success' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'info' });

  // 코드 상태
  const [jobFieldAll, setJobFieldAll] = useState<CodeItem[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<any[]>([]);
  const [educationLevels, setEdudationLevels] = useState<any[]>([]);
  const [careerLevels, setCareerLevels] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);

  // 폼 상태
  const [form, setForm] = useState<JobPostingForm>({
    title: '',
    descriptionHtml: '',
    jobFieldCode: '',
    jobFieldParentCode: '',
    locationCode: '',
    employmentTypeCode: '',
    educationLevelCode: '',
    careerLevelCode: '',
    salaryCode: '',
    applicationDeadline: null,
    isSkillsnap: false,
    isActive: true,
  });

  useEffect(() => {
    (async () => {
      const [jobTree, loc, emp, edu, car, sal] = await Promise.all([
        fetchJobFieldTree(),
        fetchFlatOptions(GROUPS.LOCATION),
        fetchFlatOptions(GROUPS.EMPLOYMENT_TYPE),
        fetchFlatOptions(GROUPS.EDUCATION_LEVEL),
        fetchFlatOptions(GROUPS.CAREER_LEVEL),
        fetchFlatOptions(GROUPS.SALARY),
      ]);
      setJobFieldAll(jobTree);
      setLocations(loc);
      setEmploymentTypes(emp);
      setEdudationLevels(edu);
      setCareerLevels(car);
      setSalaries(sal);
    })();
  }, []);

  const jobFieldParents = useMemo(() => jobFieldAll.filter(it => !it.parentCode), [jobFieldAll]);

  const jobFieldChildren = useMemo(() => {
    if (!form.jobFieldParentCode) return [];
    return jobFieldAll.filter(it => it.parentCode === form.jobFieldParentCode);
  }, [jobFieldAll, form.jobFieldParentCode]);

  const jobFieldDisplay = useMemo(() => {
    if (!form.jobFieldCode) return '';
    const child = jobFieldAll.find(it => it.code === form.jobFieldCode);
    if (!child) return '';
    if (!child.parentCode) return child.name;
    const parent = jobFieldAll.find(it => it.code === child.parentCode);
    return parent ? `${parent.name} - ${child.name}` : child.name;
  }, [form.jobFieldCode, jobFieldAll]);

  const onSelectJobParent = (parentCode: string) => {
    const children = jobFieldAll.filter(it => it.parentCode === parentCode);
    setForm(s => ({
      ...s,
      jobFieldParentCode: parentCode,
      jobFieldCode: children.length === 0 ? parentCode : '', // 자식 없으면 부모 코드 저장
    }));
  };

  // SnackBar 닫기 이벤트
  const handleClose = () => closeSnackbar(setSnackbar);

  const isValid = useMemo(() => {
    if (!form.title.trim()) return false;
    if (!form.jobFieldCode) return false;
    if (!form.locationCode || !form.employmentTypeCode || !form.educationLevelCode) return false;
    if (!form.careerLevelCode || !form.salaryCode) return false;
    const textLen = form.descriptionHtml.replace(/<[^>]+>/g, '').trim().length;
    return textLen >= 5;
  }, [form]);

  const handleSubmit = async () => {
    const cleaned = DOMPurify.sanitize(form.descriptionHtml, { USE_PROFILES: { html: true } });
    const payload = {
      title: form.title,
      description: cleaned,
      jobFieldCode: form.jobFieldCode,
      locationCode: form.locationCode,
      employmentTypeCode: form.employmentTypeCode,
      educationLevelCode: form.educationLevelCode,
      careerLevelCode: form.careerLevelCode,
      salaryCode: form.salaryCode,
      applicationDeadline: form.applicationDeadline
        ? form.applicationDeadline.format('YYYY-MM-DD')
        : null,
      isSkillsnap: form.isSkillsnap ? 'Y' : 'N',
      isActive: form.isActive ? 'Y' : 'N',
    };

    try {
      await api.post('/job/job-posting/new', payload);

      notifySuccess(setSnackbar, '공고등록이 완료되었습니다.');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Stack spacing={2}>
        {/* 제목 */}
        <Box>
          <TextField
            label="공고 제목"
            value={form.title}
            onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
            required
            fullWidth
          />
        </Box>

        {/* 코드 + 마감일 */}
        <Box
          display="grid"
          gap={2}
          gridTemplateColumns={{
            xs: '1fr',
            sm: '1fr 1fr',
            md: 'repeat(3, 1fr)',
          }}
        >
          {/* 직군(대분류) */}
          <TextField
            select
            label="직군(대분류)"
            value={form.jobFieldParentCode}
            onChange={e => onSelectJobParent(e.target.value)}
            required
            fullWidth
          >
            {jobFieldParents.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 직무(소분류) */}
          <TextField
            select
            label="직무(소분류)"
            value={form.jobFieldCode}
            onChange={e => setForm(s => ({ ...s, jobFieldCode: e.target.value }))}
            required
            disabled={!form.jobFieldParentCode || jobFieldChildren.length === 0}
            fullWidth
            helperText={
              form.jobFieldParentCode && jobFieldChildren.length === 0
                ? '선택한 대분류의 소분류가 없습니다. 대분류 코드가 최종 저장됩니다.'
                : undefined
            }
          >
            {jobFieldChildren.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 근무지 */}
          <TextField
            select
            label="근무지"
            value={form.locationCode}
            onChange={e => setForm(s => ({ ...s, locationCode: e.target.value }))}
            required
            fullWidth
          >
            {locations.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 학력 수준 */}
          <TextField
            select
            label="최소학력수준"
            value={form.educationLevelCode}
            onChange={e => setForm(s => ({ ...s, educationLevelCode: e.target.value }))}
            required
            fullWidth
          >
            {educationLevels.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 고용형태 */}
          <TextField
            select
            label="고용형태"
            value={form.employmentTypeCode}
            onChange={e => setForm(s => ({ ...s, employmentTypeCode: e.target.value }))}
            required
            fullWidth
          >
            {employmentTypes.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 경력 구분 */}
          <TextField
            select
            label="경력 구분"
            value={form.careerLevelCode}
            onChange={e => setForm(s => ({ ...s, careerLevelCode: e.target.value }))}
            required
            fullWidth
          >
            {careerLevels.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 연봉/급여 */}
          <TextField
            select
            label="연봉/급여"
            value={form.salaryCode}
            onChange={e => setForm(s => ({ ...s, salaryCode: e.target.value }))}
            required
            fullWidth
          >
            {salaries.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 마감일 */}
          <DatePicker
            label="마감일"
            format="YYYY/MM/DD"
            value={form.applicationDeadline}
            onChange={v => setForm(s => ({ ...s, applicationDeadline: v }))}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>

        {/* 선택 직무 */}
        {jobFieldDisplay && (
          <Box sx={{ color: 'text.secondary', fontSize: 14 }}>선택된 직무: {jobFieldDisplay}</Box>
        )}

        <Box display="flex" flexWrap="wrap" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={form.isSkillsnap}
                onChange={e => setForm(s => ({ ...s, isSkillsnap: e.target.checked }))}
              />
            }
            label="스킬스냅 사용"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={e => setForm(s => ({ ...s, isActive: e.target.checked }))}
              />
            }
            label="게시 활성화"
          />
        </Box>

        {/* 본문 에디터 */}
        <Box>
          <RichTextEditor
            value={form.descriptionHtml}
            onChange={html => setForm(s => ({ ...s, descriptionHtml: html }))}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <MainButtonArea saveAction={handleSubmit} saveLabel="등록" disabled={!isValid} />
        </Box>
      </Stack>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
        bottom="80px"
      />
    </LocalizationProvider>
  );
}
