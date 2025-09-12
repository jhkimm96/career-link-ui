'use client';

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';
import RichTextEditor from '@/components/richTextEditor';
import FileUpload from '@/components/fileUpload';

export interface NoticeFormData {
  noticeId: number;
  noticeType: string;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  isTopFixed: 'Y' | 'N';
  isExposed: 'Y' | 'N';
}

interface NoticeFormProps {
  form: NoticeFormData;
  setForm: React.Dispatch<React.SetStateAction<NoticeFormData>>;
  fileName?: string;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  isEdit?: boolean;
}

export default function NoticeForm({
  form,
  setForm,
  fileName,
  onFileChange,
  onSubmit,
  isEdit = false,
}: NoticeFormProps) {
  const handleChange =
    (field: keyof NoticeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleCheck = (field: keyof NoticeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.checked ? 'Y' : 'N' }));
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Stack spacing={2}>
        <CommonSelectBox
          label="공지유형"
          groupCode="NOTICE"
          parentCode="TYPE"
          value={form.noticeType ?? ''}
          onChange={value => setForm(prev => ({ ...prev, noticeType: value }))}
        />

        <TextField
          label="제목"
          value={form.title ?? ''}
          onChange={handleChange('title')}
          fullWidth
          size="small"
        />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            내용
          </Typography>
          <Box
            sx={{
              height: 300,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 1,
            }}
          >
            <RichTextEditor
              value={form.content}
              onChange={html => setForm(prev => ({ ...prev, content: html }))}
              style={{ height: '240px', backgroundColor: '#f9f9f9' }}
            />
          </Box>
        </Box>

        <FileUpload
          label="파일 선택"
          accept="*"
          fileName={fileName ?? ''}
          onFileChange={onFileChange}
        />

        <Box display="flex" gap={2}>
          <TextField
            type="date"
            label="시작일"
            value={form.startDate ?? ''}
            onChange={handleChange('startDate')}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label="종료일"
            value={form.endDate ?? ''}
            onChange={handleChange('endDate')}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox checked={form.isTopFixed === 'Y'} onChange={handleCheck('isTopFixed')} />
          }
          label="상단 고정"
        />
        <FormControlLabel
          control={
            <Checkbox checked={form.isExposed === 'Y'} onChange={handleCheck('isExposed')} />
          }
          label="노출 여부"
        />

        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" size="small" onClick={onSubmit}>
            {isEdit ? '수정' : '등록'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
