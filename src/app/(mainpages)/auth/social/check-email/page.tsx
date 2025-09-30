'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';

export default function CheckEmailPage() {
  const sp = useSearchParams();
  const email = sp.get('email') ?? '';
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackType, setSnackType] = useState<'success' | 'error'>('success');

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? '', []);

  const handleResend = useCallback(async () => {
    if (!email) return;
    try {
      setLoading(true);
      const url = new URL('/api/auth/link/resend', apiBase || window.location.origin).toString();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('재전송 요청 실패');

      setSnackType('success');
      setSnackMsg('재전송했습니다. 메일함을 확인해 주세요.');
      setSnackOpen(true);
    } catch (e) {
      setSnackType('error');
      setSnackMsg('재전송 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
      setSnackOpen(true);
    } finally {
      setLoading(false);
    }
  }, [email, apiBase]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>
            이메일을 확인하세요
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {email ? <b>{email}</b> : '등록된 이메일'} 으로 소셜 계정 연결 확인 메일을 보냈어요.
            메일의 버튼을 누르면 연결이 완료되고 자동으로 로그인됩니다.
          </Typography>

          <List dense sx={{ listStyleType: 'decimal', pl: 3 }}>
            <ListItem sx={{ display: 'list-item', pl: 0 }}>
              <ListItemText primary="메일이 없다면 스팸함을 확인해 주세요." />
            </ListItem>
            <ListItem sx={{ display: 'list-item', pl: 0 }}>
              <ListItemText primary="1–2분 뒤에도 없으면 다시 시도하거나 메일 재전송을 눌러 주세요." />
            </ListItem>
          </List>

          <Box>
            <Button variant="outlined" onClick={handleResend} disabled={!email || loading}>
              {loading ? '재전송 중...' : '재전송'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackType} onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
