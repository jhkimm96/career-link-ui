'use client';

import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';
import { useConfirm } from '@/components/confirm';

type Faq = {
  faqId?: number;
  category: string;
  question: string;
  answer: string;
};

type EditableFaq = Faq & { isEditing?: boolean };

export default function AdminFaqPage() {
  const confirm = useConfirm();
  const [faqs, setFaqs] = useState<EditableFaq[]>([]);
  const categoryMap = useCommonCodeMap('FAQ', 'CATEGORY');
  const entries = Object.entries(categoryMap); // map: Record<string, string>
  const [category, setCategory] = useState(entries[0]?.[0] ?? '');
  const [form, setForm] = useState<Faq | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  useEffect(() => {
    if (entries.length > 0 && !category) {
      setCategory(entries[0][0]);
    }
  }, [entries]);

  useEffect(() => {
    if (category) {
      fetchFaqs();
      setForm(null);
    }
  }, [category]);

  const fetchFaqs = async () => {
    try {
      const res = await api.get('/admin/faq/getFaqs', {
        params: { category: category },
      });
      setFaqs(res.data ?? []);
      setExpandedFaqId(null);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };
  const handleAccordionChange = (faqId: number) => {
    setExpandedFaqId(prev => (prev === faqId ? null : faqId));
  };
  const handleAdd = () => {
    setForm({ category: category, question: '', answer: '' });
  };

  const handleSaveNew = async () => {
    try {
      await api.post('/admin/faq/createFaq', form);
      notifySuccess(setSnackbar, '등록되었습니다.');
      setForm(null);
      fetchFaqs();
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  const handleEditToggle = (faqId: number) => {
    setFaqs(prev => prev.map(f => (f.faqId === faqId ? { ...f, isEditing: !f.isEditing } : f)));
  };

  const handleChange = (faqId: number, field: keyof Faq, value: string) => {
    setFaqs(prev => prev.map(f => (f.faqId === faqId ? { ...f, [field]: value } : f)));
  };

  const handleSaveEdit = async (faq: EditableFaq) => {
    try {
      const res = await api.put('/admin/faq/updateFaq', faq);
      notifySuccess(setSnackbar, res.message);
      setFaqs(prev => prev.map(f => (f.faqId === faq.faqId ? { ...faq, isEditing: false } : f)));
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  const handleDelete = async (faqId?: number) => {
    const isConfirmed = await confirm({
      title: '삭제하시겠습니까?',
      message: '삭제된 질문은 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      destructive: true,
      intent: 'error',
    });
    if (isConfirmed) {
      try {
        await api.delete(`/admin/faq/deleteFaq/${faqId}`);
        notifySuccess(setSnackbar, '삭제되었습니다.');
        fetchFaqs();
      } catch (e: any) {
        notifyError(setSnackbar, e.message);
      }
    }
  };

  const headerActions = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CommonSelectBox
        groupCode="FAQ"
        parentCode="CATEGORY"
        label="카테고리"
        value={category}
        onChange={setCategory}
        size="small"
        fullWidth={false}
      />
      <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={!category}
      >
        등록
      </Button>
    </Box>
  );

  return (
    <PageSectionLayout title="자주 묻는 질문 관리" actions={headerActions}>
      <Stack spacing={4}>
        {/* 등록 폼 */}
        {form && (
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="h6" component="div" mb={2}>
              FAQ 등록
            </Typography>
            <Stack spacing={2}>
              <CommonSelectBox
                groupCode="FAQ"
                parentCode="CATEGORY"
                value={form.category}
                label="카테고리"
                onChange={v => setForm(prev => ({ ...prev!, category: v }))}
                size="small"
                fullWidth
              />
              <TextField
                label="질문"
                size="small"
                fullWidth
                value={form.question}
                onChange={e => setForm(prev => ({ ...prev!, question: e.target.value }))}
              />
              <TextField
                label="답변"
                size="small"
                fullWidth
                multiline
                minRows={4}
                value={form.answer}
                onChange={e => setForm(prev => ({ ...prev!, answer: e.target.value }))}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleSaveNew}
                  startIcon={<SaveIcon />}
                  disabled={!form.category || !form.question || !form.answer}
                >
                  등록
                </Button>
                <Button variant="outlined" onClick={() => setForm(null)} startIcon={<CancelIcon />}>
                  취소
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* FAQ 목록 */}
        <Stack spacing={2}>
          {faqs.map(faq => (
            <Accordion
              key={faq.faqId}
              disableGutters
              elevation={0}
              expanded={expandedFaqId === faq.faqId}
              onChange={() => handleAccordionChange(faq.faqId as number)}
              square
              sx={{
                border: '1px solid #ddd',
                borderRadius: 2,
                overflow: 'hidden',
                '&.Mui-expanded': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiAccordionSummary-content': { my: 1 },
                }}
              >
                {faq.isEditing ? (
                  <TextField
                    size="small"
                    value={faq.question}
                    onChange={e => handleChange(faq.faqId!, 'question', e.target.value)}
                    fullWidth
                  />
                ) : (
                  <Typography variant="subtitle1" fontWeight={600}>
                    {faq.question}
                  </Typography>
                )}
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  bgcolor: 'grey.50',
                  px: 3,
                  py: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                {faq.isEditing ? (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      size="small"
                      value={faq.answer}
                      onChange={e => handleChange(faq.faqId!, 'answer', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveEdit(faq)}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => handleEditToggle(faq.faqId!)}
                      >
                        취소
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Typography
                      component="div"
                      sx={{
                        lineHeight: 1.75,
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                        mb: 2,
                      }}
                    >
                      {faq.answer}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditToggle(faq.faqId!)}
                      >
                        수정
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(faq.faqId)}
                      >
                        삭제
                      </Button>
                    </Stack>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
          bottom="10px"
        />
      </Stack>
    </PageSectionLayout>
  );
}
