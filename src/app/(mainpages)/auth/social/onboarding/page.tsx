'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type AlertColor,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import { useAuth } from '@/libs/authContext';

const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

type Me = { email: string; userName: string; provider: string };

export default function SocialOnboardingPage() {
  const sp = useSearchParams();
  const code = sp.get('code') ?? '';
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const { signIn } = useAuth();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const notifyClose = () => closeSnackbar(setSnackbar);

  const [formData, setFormData] = useState<{
    userName: string;
    phoneNumber: string;
    birthDate: Dayjs | null;
    email: string;
    agreeTerms: boolean;
    agreePrivacy: boolean;
    agreeMarketing: boolean;
  }>({
    userName: '',
    phoneNumber: '',
    birthDate: null,
    email: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  const [helperText, setHelperText] = useState({ phoneNumber: '' });
  const [hasError, setHasError] = useState({ phoneNumber: false });

  const [openDialog, setOpenDialog] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const open = (key: 'terms' | 'privacy' | 'marketing') =>
    setOpenDialog(prev => ({ ...prev, [key]: true }));
  const close = (key: 'terms' | 'privacy' | 'marketing') =>
    setOpenDialog(prev => ({ ...prev, [key]: false }));

  // 파일 경로(공통)
  const LEGAL = {
    terms: '/legal/careerlinkTermsOfService.html',
    privacy: '/legal/privacy-terms.html',
    marketing: '/legal/marketing-terms.html',
  };
  // 날짜 셀렉트
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, i) => currentYear - i),
    [currentYear]
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const [y, setY] = useState<number | ''>('');
  const [m, setM] = useState<number | ''>('');
  const [d, setD] = useState<number | ''>('');
  const daysInMonth = useMemo(
    () => (!y || !m ? 31 : new Date(Number(y), Number(m), 0).getDate()),
    [y, m]
  );
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  useEffect(() => {
    if (d && typeof d === 'number' && d > daysInMonth) setD('');
  }, [daysInMonth, d]);
  useEffect(() => {
    if (y && m && d) {
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: dayjs(`${y}-${mm}-${dd}`) }));
    } else {
      setFormData(prev => ({ ...prev, birthDate: null }));
    }
  }, [y, m, d]);

  // 프리필 로드
  useEffect(() => {
    (async () => {
      if (!code) {
        notifyError(setSnackbar, '세션이 만료되었어요. 다시 소셜 로그인해 주세요.');
        router.replace('/login?reason=missing_code');
        return;
      }
      try {
        const res = await fetch(`${API}/api/auth/social/me?code=${encodeURIComponent(code)}`, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });
        if (res.status === 410 || res.status === 404) {
          notifyError(setSnackbar, '세션이 만료되었어요. 다시 시도해 주세요.');
          router.replace('/login?reason=expired_code');
          return;
        }
        if (!res.ok) throw new Error(await res.text());

        const json = await res.json();
        const data = json.body as Me;
        setMe(data);
        setFormData(prev => ({
          ...prev,
          email: data.email ?? '',
          userName: data.userName ?? '',
        }));
      } catch (e: any) {
        notifyError(setSnackbar, e.message ?? '오류가 발생했어요.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target as any;

    if (name === 'phoneNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      let formatted = onlyNums;
      if (onlyNums.length <= 3) formatted = onlyNums;
      else if (onlyNums.length <= 7) formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;

      const phoneRegex = /^01([0|1|6|7|8|9])-\d{3,4}-\d{4}$/;
      const isValid = phoneRegex.test(formatted);

      setFormData(prev => ({ ...prev, phoneNumber: formatted }));
      if (!isValid && onlyNums.length >= 10) {
        setHelperText(prev => ({ ...prev, phoneNumber: '올바른 휴대폰 번호 형식이 아닙니다.' }));
        setHasError(prev => ({ ...prev, phoneNumber: true }));
      } else {
        setHelperText(prev => ({ ...prev, phoneNumber: '' }));
        setHasError(prev => ({ ...prev, phoneNumber: false }));
      }
      return;
    }

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName.trim()) return notifyError(setSnackbar, '이름을 입력해 주세요.');
    if (!formData.phoneNumber.trim())
      return notifyError(setSnackbar, '휴대폰 번호를 입력해 주세요.');
    if (hasError.phoneNumber) return notifyError(setSnackbar, '휴대폰 번호 형식을 확인해 주세요.');
    if (!formData.agreeTerms || !formData.agreePrivacy)
      return notifyError(setSnackbar, '필수 약관에 동의해 주세요.');

    try {
      const payload = {
        code,
        userName: formData.userName.trim(),
        phoneNumber: formData.phoneNumber.replace(/\D/g, ''), // ✅ 서버 DTO와 일치
        birthDate: formData.birthDate ? formData.birthDate.format('YYYY-MM-DD') : null,
        agreeTerms: formData.agreeTerms ? 'Y' : 'N',
        agreePrivacy: formData.agreePrivacy ? 'Y' : 'N',
        agreeMarketing: formData.agreeMarketing ? 'Y' : 'N',
      };

      const res = await fetch(`${API}/api/auth/social/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 410 || res.status === 404) {
        notifyError(setSnackbar, '세션이 만료되었어요. 다시 소셜 로그인해 주세요.');
        router.replace('/login?reason=expired_code');
        return;
      }
      if (!res.ok) throw new Error(await res.text());

      notifySuccess(setSnackbar, '가입이 완료되었습니다.');
      await signIn();
      router.replace('/main');
    } catch (err: any) {
      notifyError(setSnackbar, err.message ?? '오류가 발생했어요.');
    }
  };

  if (loading) {
    return (
      <main>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          불러오는 중…
        </Box>
      </main>
    );
  }
  if (!me) {
    return (
      <main>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          세션이 만료되었어요. 다시 시도해 주세요.
          <Button variant="contained" onClick={() => router.replace('/login')}>
            다시 소셜 로그인
          </Button>
        </Box>
      </main>
    );
  }

  return (
    <main>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 6,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
            bgcolor: 'white',
            boxShadow: 3,
            borderRadius: 3,
            p: 4,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            소셜 회원가입
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {me.provider} 계정 정보로 일부 항목이 미리 채워졌어요. 추가 정보를 입력해 주세요.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <TextField
              label="이메일"
              value={formData.email ?? ''}
              disabled={!!formData.email}
              fullWidth
            />

            <TextField
              label="이름"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              fullWidth
            />

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2}>
              <FormControl fullWidth>
                <InputLabel id="year-label">년</InputLabel>
                <Select
                  labelId="year-label"
                  label="년"
                  value={y}
                  onChange={e => setY(e.target.value as number)}
                >
                  <MenuItem value="">
                    <em>선택</em>
                  </MenuItem>
                  {years.map(yy => (
                    <MenuItem key={yy} value={yy}>
                      {yy}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="month-label">월</InputLabel>
                <Select
                  labelId="month-label"
                  label="월"
                  value={m}
                  onChange={e => setM(e.target.value as number)}
                >
                  <MenuItem value="">
                    <em>선택</em>
                  </MenuItem>
                  {months.map(mm => (
                    <MenuItem key={mm} value={mm}>
                      {mm}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!y || !m}>
                <InputLabel id="day-label">일</InputLabel>
                <Select
                  labelId="day-label"
                  label="일"
                  value={d}
                  onChange={e => setD(e.target.value as number)}
                >
                  <MenuItem value="">
                    <em>선택</em>
                  </MenuItem>
                  {days.map(dd => (
                    <MenuItem key={dd} value={dd}>
                      {dd}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="휴대폰 번호"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={hasError.phoneNumber}
              helperText={hasError.phoneNumber ? helperText.phoneNumber : ''}
              required
              fullWidth
            />

            {/* 약관 */}
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Box display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                    />
                  }
                  label="[필수] 서비스 이용약관 동의"
                />
                <Button onClick={() => open('terms')} size="small" sx={{ textTransform: 'none' }}>
                  상세 보기
                </Button>
              </Box>
              {!formData.agreeTerms && (
                <FormHelperText error>서비스 이용약관 동의는 필수입니다.</FormHelperText>
              )}

              <Box display="flex" alignItems="center" mt={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleChange}
                    />
                  }
                  label="[필수] 개인정보 수집 및 이용 동의"
                />
                <Button onClick={() => open('privacy')} size="small" sx={{ textTransform: 'none' }}>
                  상세 보기
                </Button>
              </Box>
              {!formData.agreePrivacy && (
                <FormHelperText error>개인정보 수집 및 이용 동의는 필수입니다.</FormHelperText>
              )}

              <Box display="flex" alignItems="center" mt={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onChange={handleChange}
                    />
                  }
                  label="[선택] 마케팅 정보 수신 동의"
                />
                <Button
                  onClick={() => open('marketing')}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  상세 보기
                </Button>
              </Box>
            </Box>

            <Dialog open={openDialog.terms} onClose={() => close('terms')} maxWidth="md" fullWidth>
              <DialogTitle>서비스 이용약관</DialogTitle>
              <DialogContent dividers sx={{ p: 0, height: { xs: '60vh', md: 480 } }}>
                <Box
                  component="iframe"
                  src={LEGAL.terms}
                  title="서비스 이용약관"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0, display: 'block' }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => close('terms')} variant="contained">
                  확인
                </Button>
                <Button
                  component="a"
                  href={LEGAL.terms}
                  target="_blank"
                  rel="noopener"
                  sx={{ textTransform: 'none' }}
                >
                  새 창에서 보기
                </Button>
              </DialogActions>
            </Dialog>

            {/* 개인정보 수집·이용 동의 다이얼로그 */}
            <Dialog
              open={openDialog.privacy}
              onClose={() => close('privacy')}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>개인정보 수집 및 이용 동의</DialogTitle>
              <DialogContent dividers sx={{ p: 0, height: { xs: '60vh', md: 480 } }}>
                <Box
                  component="iframe"
                  src={LEGAL.privacy}
                  title="개인정보 수집 및 이용 동의"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0, display: 'block' }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => close('privacy')} variant="contained">
                  확인
                </Button>
                <Button
                  component="a"
                  href={LEGAL.privacy}
                  target="_blank"
                  rel="noopener"
                  sx={{ textTransform: 'none' }}
                >
                  새 창에서 보기
                </Button>
              </DialogActions>
            </Dialog>

            {/* 마케팅 정보 수신 동의 다이얼로그 */}
            <Dialog
              open={openDialog.marketing}
              onClose={() => close('marketing')}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>마케팅 정보 수신 동의</DialogTitle>
              <DialogContent dividers sx={{ p: 0, height: { xs: '60vh', md: 480 } }}>
                <Box
                  component="iframe"
                  src={LEGAL.marketing}
                  title="마케팅 정보 수신 동의"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0, display: 'block' }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => close('marketing')} variant="contained">
                  확인
                </Button>
                <Button
                  component="a"
                  href={LEGAL.marketing}
                  target="_blank"
                  rel="noopener"
                  sx={{ textTransform: 'none' }}
                >
                  새 창에서 보기
                </Button>
              </DialogActions>
            </Dialog>

            <Box display="flex" gap={2} mt={3}>
              <Button type="submit" variant="contained" fullWidth>
                가입 완료
              </Button>
              <Button variant="outlined" fullWidth onClick={() => router.push('/login')}>
                취소
              </Button>
            </Box>
          </Box>
        </Box>
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={notifyClose}
        />
      </Box>
    </main>
  );
}
