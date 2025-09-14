'use client';

import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import { CoverLetterDto, CoverLetterItemDto } from '@/types/applicant/coverLetter';

interface CoverLetterFormProps {
  value: CoverLetterDto;
  onChange: (value: CoverLetterDto) => void;
}

export default function CoverLetterForm({ value, onChange }: CoverLetterFormProps) {
  /** CoverLetter 필드 변경 */
  const handleCoverLetterChange = (field: keyof CoverLetterDto, val: any) => {
    onChange({ ...value, [field]: val });
  };

  /** Item 추가 */
  const handleAddItem = () => {
    const items = value.items ? [...value.items] : [];
    items.push({ title: '', content: '' }); // 새 항목
    onChange({ ...value, items });
  };

  /** Item 제거 */
  const handleRemoveItem = (itemIdx: number) => {
    const items = value.items ? [...value.items] : [];
    onChange({ ...value, items: items.filter((_, i) => i !== itemIdx) });
  };

  /** Item 필드 변경 */
  const handleItemChange = (itemIdx: number, field: keyof CoverLetterItemDto, val: any) => {
    const items = value.items ? [...value.items] : [];
    items[itemIdx] = { ...items[itemIdx], [field]: val };
    onChange({ ...value, items });
  };

  return (
    <Box>
      {/* 자기소개서 제목 + 활성화 */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <TextField
          label="자기소개서 제목"
          fullWidth
          value={value.coverLetterTitle || ''}
          onChange={e => handleCoverLetterChange('coverLetterTitle', e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={value.isActive === 'Y'}
              onChange={e => handleCoverLetterChange('isActive', e.target.checked ? 'Y' : 'N')}
            />
          }
          label="활성화"
        />
      </Stack>

      {/* 항목 리스트 */}
      <Stack spacing={3}>
        {value.items?.map((item, itemIdx) => (
          <Stack key={itemIdx} spacing={2}>
            <TextField
              label="항목 제목"
              fullWidth
              value={item.title || ''}
              onChange={e => handleItemChange(itemIdx, 'title', e.target.value)}
            />
            <TextField
              label="항목 내용"
              fullWidth
              multiline
              rows={4}
              value={item.content || ''}
              onChange={e => handleItemChange(itemIdx, 'content', e.target.value)}
            />
            <Stack direction="row" justifyContent="flex-end">
              <IconButton onClick={() => handleRemoveItem(itemIdx)} color="error">
                <DeleteOutline />
              </IconButton>
            </Stack>
          </Stack>
        ))}

        {/* 항목 추가 버튼 */}
        <Button startIcon={<AddCircleOutline />} onClick={handleAddItem}>
          항목 추가
        </Button>
      </Stack>
    </Box>
  );
}
