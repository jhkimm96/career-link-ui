'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  Paper,
  AlertColor,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '@/api/axios';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError } from '@/api/apiNotify';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';

type Faq = {
  faqId: number;
  question: string;
  answer: string;
  category: string;
};

export default function FaqPage() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const categoryMap = useCommonCodeMap('FAQ_CATEGORY', 'CATEGORY');
  const entries = Object.entries(categoryMap);
  const [category, setCategory] = useState(entries[0]?.[0]);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  useEffect(() => {
    if (entries.length > 0 && !category) {
      setCategory(entries[0][0]);
    }
  }, [entries, category]);

  useEffect(() => {
    if (category) fetchFaqs();
  }, [category]);

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await api.get('/faq/getFaqs', {
        params: { category },
      });
      setFaqs(res.data ?? []);
      setExpandedFaqId(null); // 새로 로드 시 모두 닫기
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  }, [category]);

  const handleAccordionChange = (faqId: number) => {
    setExpandedFaqId(prev => (prev === faqId ? null : faqId));
  };

  const handleClose = () => closeSnackbar(setSnackbar);

  const renderChips = (
    map: Record<string, string>,
    selected: string,
    setSelected: (v: string) => void
  ) => (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {entries.map(([code, name]) => (
        <Chip
          key={code}
          label={name}
          color={selected === code ? 'primary' : 'default'}
          variant={selected === code ? 'filled' : 'outlined'}
          onClick={() => setSelected(code)}
        />
      ))}
    </Stack>
  );

  return (
    <PagesSectionLayout title="자주 묻는 질문 (FAQ)">
      <Box>
        <Paper sx={{ p: 2 }}>{renderChips(categoryMap, category, setCategory)}</Paper>
        <Stack spacing={2}>
          {faqs.map(faq => (
            <Accordion
              key={faq.faqId}
              disableGutters
              elevation={0}
              expanded={expandedFaqId === faq.faqId}
              onChange={() => handleAccordionChange(faq.faqId)}
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
                <Typography variant="subtitle1" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  bgcolor: 'grey.50',
                  px: 3,
                  py: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                <Typography
                  component="div"
                  sx={{ lineHeight: 1.75, whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleClose}
          bottom="10px"
        />
      </Box>
    </PagesSectionLayout>
  );
}
