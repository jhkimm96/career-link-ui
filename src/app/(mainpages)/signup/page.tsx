'use client';

import React, { useEffect, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import {
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  FormHelperText,
  type AlertColor,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';

interface CheckIdResponse {
  exists: boolean;
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isEmailAuth, setIsEmailAuth] = React.useState(false); // 이메일 인증 활성화 여부
  const [isPhoneAuth, setIsPhoneAuth] = React.useState(false); // 휴대폰 인증 활성화 여부
  const [verifyCode, setVerifyCode] = React.useState('');
  const [isIdChecked, setIsIdChecked] = React.useState(false);
  const [isVerifyChecked, setIsVerifyChecked] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    loginId: string;
    password: string;
    confirmPassword: string;
    socialType: string;
    userType: string;
    userName: string;
    phoneNumber: string;
    birthDate: Dayjs | null;
    gender: string;
    email: string;
    agreeTerms: string;
    agreePrivacy: string;
    agreeMarketing: string;
  }>({
    loginId: '',
    password: '',
    confirmPassword: '',
    socialType: '',
    userType: 'USER',
    userName: '',
    phoneNumber: '',
    birthDate: null,
    gender: '',
    email: '',
    agreeTerms: 'N',
    agreePrivacy: 'N',
    agreeMarketing: 'N',
  });

  const [helperText, setHelperText] = React.useState({
    loginId: '',
    confirmPassword: '',
    phoneNumber: '',
    email: '',
    verifyCode: '',
  });
  const [hasError, setHasError] = React.useState({
    loginId: false,
    confirmPassword: false,
    verifyCode: false,
    agreeTerms: true,
    agreePrivacy: true,
    phoneNumber: false,
    email: false,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const [openDialog, setOpenDialog] = React.useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const router = useRouter();

  useEffect(() => {
    setIsEmailAuth(true);
    setIsPhoneAuth(false);
  }, []);

  const handleOpenDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: true }));
  };

  const handleCloseDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: false }));
  };

  const handleClose = () => {
    closeSnackbar(setSnackbar);
  };

  // ====== 생년월일 Selects (년/월/일) ======
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, i) => currentYear - i),
    [currentYear]
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const [y, setY] = useState<number | ''>('');
  const [m, setM] = useState<number | ''>('');
  const [d, setD] = useState<number | ''>('');
  const daysInMonth = useMemo(() => {
    if (!y || !m) return 31;
    return new Date(Number(y), Number(m), 0).getDate();
  }, [y, m]);
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

  // 아이디 및 비밀번호 , 휴대폰 번호 형식 체크
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'loginId') {
      const newValue = value
        .replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
        .toLowerCase()
        .replace(/\s/g, '');

      const idRegex = /^[a-z0-9]{5,20}$/;

      setFormData(prev => ({ ...prev, [name]: newValue }));

      if (newValue.length > 0 && newValue.length < 5) {
        setHelperText(prev => ({ ...prev, loginId: '아이디는 5자 이상이어야 합니다.' }));
        setHasError(prev => ({ ...prev, loginId: true }));
        setIsIdChecked(false);
      } else if (!idRegex.test(newValue)) {
        setHelperText(prev => ({
          ...prev,
          loginId: '아이디는 영문 소문자와 숫자만 입력가능합니다.',
        }));
        setHasError(prev => ({ ...prev, loginId: true }));
        setIsIdChecked(false);
      } else {
        setHelperText(prev => ({ ...prev, loginId: '' }));
        setHasError(prev => ({ ...prev, loginId: true }));
        setIsIdChecked(false);
      }
    } else if (name === 'confirmPassword') {
      const isMatch = value === formData.password;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (!isMatch) {
        setHelperText(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
        setHasError(prev => ({ ...prev, confirmPassword: true }));
      } else {
        setHelperText(prev => ({ ...prev, confirmPassword: '' }));
        setHasError(prev => ({ ...prev, confirmPassword: false }));
      }
    } else if (name === 'phoneNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');

      let formatted = onlyNums;
      if (onlyNums.length <= 3) {
        formatted = onlyNums;
      } else if (onlyNums.length <= 7) {
        formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else {
        formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
      }

      const phoneRegex = /^01([0|1|6|7|8|9])-\d{3,4}-\d{4}$/;
      const isValid = phoneRegex.test(formatted);

      setFormData(prev => ({ ...prev, [name]: formatted }));

      if (!isValid && onlyNums.length >= 10) {
        setHelperText(prev => ({ ...prev, phoneNumber: '올바른 휴대폰 번호 형식이 아닙니다.' }));
        setHasError(prev => ({ ...prev, phoneNumber: true }));
      } else {
        setHelperText(prev => ({ ...prev, phoneNumber: '' }));
        setHasError(prev => ({ ...prev, phoneNumber: false }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 아이디 중복확인
  const handleCheckDuplicate = async () => {
    const loginId = formData.loginId.trim();

    if (!loginId) {
      setHelperText(prev => ({ ...prev, loginId: '아이디를 입력해주세요.' }));
      setHasError(prev => ({ ...prev, loginId: true }));
      return;
    }

    if (loginId.length < 5) {
      setHelperText(prev => ({ ...prev, loginId: '아이디는 5자 이상으로 입력해주세요.' }));
      setHasError(prev => ({ ...prev, loginId: true }));
      return;
    }

    try {
      const response = await api.get<CheckIdResponse>(`/api/users/check-id?loginId=${loginId}`);

      if (response.data.exists) {
        setHelperText(prev => ({ ...prev, loginId: '이미 사용중인 아이디입니다.' }));
        setHasError(prev => ({ ...prev, loginId: true }));
      } else {
        setHelperText(prev => ({ ...prev, loginId: '사용가능한 아이디입니다.' }));
        setHasError(prev => ({ ...prev, loginId: false }));
        setIsIdChecked(true);
      }
    } catch (error) {
      setHelperText(prev => ({ ...prev, loginId: '오류가 발생했습니다. 다시 시도해주세요.' }));
      setHasError(prev => ({ ...prev, loginId: true }));
    }
  };

  // 본인인증 버튼 클릭 이벤트
  const handleSendVerification = async (type: 'phone' | 'email') => {
    let url = '';
    let payload: Record<string, any> = {};

    try {
      if (type === 'email') {
        const email = (formData.email ?? '').trim();

        if (!email) {
          notifyError(setSnackbar, '이메일을 입력해 주세요.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          notifyError(setSnackbar, '이메일 형식을 확인해 주세요.');
          return;
        }

        payload = { email: email, userName: formData.userName };

        url = '/api/users/send-email-code';
      }

      if (type === 'phone') {
        let phone = (formData.phoneNumber ?? '').toString().trim();
        if (!phone) {
          notifyError(setSnackbar, '휴대폰 번호를 입력해 주세요.');
          return;
        }
        phone = phone.replace(/\D/g, '');
        if (phone.length < 10) {
          notifyError(setSnackbar, '휴대폰 번호 형식을 확인해 주세요.');
          return;
        }
        payload = { phoneNumber: phone };
        url = '/api/users/send-sms';
      }

      const res = await api.post(url, payload);
      notifySuccess(setSnackbar, '입력하신 정보로 인증번호가 발송되었습니다.');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  // 본인확인 인증코드 검증
  const handleVerifyCheck = async () => {
    try {
      let url = '';
      let payload: Record<string, any> = {};

      if (isEmailAuth) {
        if (!formData.email || !verifyCode) {
          notifyError(setSnackbar, '이메일 또는 인증번호를 확인해 주세요.');
          return;
        }
        url = '/api/users/verify-email-code';
        payload = { email: formData.email };
      } else if (isPhoneAuth) {
        if (!formData.phoneNumber || !verifyCode) {
          notifyError(setSnackbar, '휴대폰 번호 또는 인증번호를 확인해 주세요.');
          return;
        }

        url = '/api/users/verify-phone-code';
        payload = { phoneNumber: formData.phoneNumber.replace(/\D/g, '') };
      } else {
        notifyError(setSnackbar, '인증 방식을 선택해 주세요.');
        return;
      }

      const res = await api.post(url, {
        ...payload,
        code: verifyCode,
      });

      if (res.data) {
        notifySuccess(setSnackbar, '인증번호가 확인되었습니다.');
        setHelperText(prev => ({ ...prev, verifyCode: '인증되었습니다.' }));
        setHasError(prev => ({ ...prev, verifyCode: false }));
        setIsVerifyChecked(true);
      } else {
        notifyError(setSnackbar, '인증번호가 일치하지 않습니다.');
        setIsVerifyChecked(false);
      }
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
      setIsVerifyChecked(false);
    }
  };

  // 회원가입 이벤트
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isIdChecked) {
      notifyError(setSnackbar, '아이디 중복체크 후 진행해 주세요.');
      return;
    }

    if (!isVerifyChecked) {
      notifyError(setSnackbar, '본인인증 후 진행해 주세요.');
      return;
    }

    const hasAnyError = Object.values(hasError).some(error => error);
    if (hasAnyError) {
      notifyError(setSnackbar, '입력한 내용을 확인해 주세요.');
      return;
    }

    try {
      const response = await api.post(
        '/api/users/signup',
        {
          loginId: formData.loginId,
          password: formData.password,
          socialType: formData.socialType,
          userType: formData.userType,
          userName: formData.userName,
          phoneNumber: formData.phoneNumber,
          birthDate: formData.birthDate ? formData.birthDate.format('YYYY-MM-DD') : '',
          gender: formData.gender,
          email: formData.email,
          agreeTerms: formData.agreeTerms,
          agreePrivacy: formData.agreePrivacy,
          agreeMarketing: formData.agreeMarketing,
        },
        {
          withCredentials: false,
        }
      );
      notifySuccess(setSnackbar, '회원가입에 성공하였습니다.');
      router.push('/login');
    } catch (error: any) {
      notifyError(setSnackbar, error.message);
    }
  };

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
            회원가입
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            아래 정보를 입력하여 회원가입을 진행해주세요.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            {/* 아이디 + 중복확인 */}
            <Box display="flex" gap={1}>
              <TextField
                label="아이디"
                name="loginId"
                variant="outlined"
                value={formData.loginId}
                onChange={handleChange}
                error={hasError.loginId}
                helperText={helperText.loginId}
                required
                fullWidth
              />
              <Button
                variant="outlined"
                sx={{ whiteSpace: 'nowrap', minWidth: 90 }}
                onClick={handleCheckDuplicate}
              >
                중복확인
              </Button>
            </Box>

            {/* 비밀번호 */}
            <TextField
              label="비밀번호"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              fullWidth
            />

            {/* 비밀번호 확인 */}
            <TextField
              label="비밀번호 확인"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={hasError.confirmPassword}
              helperText={helperText.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(p => !p)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              fullWidth
            />

            {/* 이름 */}
            <TextField
              label="이름"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              fullWidth
            />

            {/* 생년월일 (년/월/일 Select) */}
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

            <TextField
              label="이메일"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={hasError.email}
              helperText={hasError.email ? helperText.email : ''}
              required
              fullWidth
            />

            {/* 휴대폰 번호 + 본인인증 */}
            {isPhoneAuth && (
              <Button
                variant="outlined"
                sx={{ whiteSpace: 'nowrap', minWidth: 90 }}
                onClick={() => handleSendVerification('phone')}
              >
                본인인증
              </Button>
            )}

            {/* 이메일 + 본인인증 */}
            {isEmailAuth && (
              <Button
                variant="outlined"
                sx={{ whiteSpace: 'nowrap', minWidth: 90 }}
                onClick={() => handleSendVerification('email')}
              >
                본인인증
              </Button>
            )}

            {/* 인증번호 */}
            <Box display="flex" gap={1}>
              <TextField
                label="인증번호"
                name="verifyCode"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value)}
                error={hasError.verifyCode}
                helperText={helperText.verifyCode}
                required
                fullWidth
              />
              <Button
                variant="outlined"
                sx={{ whiteSpace: 'nowrap', minWidth: 90 }}
                onClick={handleVerifyCheck}
              >
                확인
              </Button>
            </Box>

            {/* 약관 동의 */}
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Box display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeTerms === 'Y'}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setFormData(prev => ({ ...prev, agreeTerms: isChecked ? 'Y' : 'N' }));
                        setHasError(prev => ({ ...prev, agreeTerms: !isChecked }));
                      }}
                    />
                  }
                  label="[필수] 서비스 이용약관 동의"
                />
                <Button
                  onClick={() => handleOpenDialog('terms')}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  상세 보기
                </Button>
              </Box>
              {hasError.agreeTerms && (
                <FormHelperText error>서비스 이용약관 동의는 필수입니다.</FormHelperText>
              )}

              <Dialog
                open={openDialog.terms}
                onClose={() => handleCloseDialog('terms')}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>서비스 이용약관 동의 안내</DialogTitle>
                <DialogContent dividers sx={{ p: 0, height: { xs: '60vh', md: 480 } }}>
                  <Box
                    component="iframe"
                    src="/legal/careerlinkTermsOfService.html"
                    title="서비스 이용약관 동의 안내"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    style={{ border: 0, display: 'block' }}
                  />
                </DialogContent>
                <DialogActions>
                  <DialogActions>
                    <Button onClick={() => handleCloseDialog('terms')} variant="contained">
                      확인
                    </Button>

                    <Button
                      component="a"
                      href="/legal/careerlinkTermsOfService.html"
                      target="_blank"
                      rel="noopener"
                      sx={{ textTransform: 'none' }}
                    >
                      새 창에서 보기
                    </Button>
                  </DialogActions>
                </DialogActions>
              </Dialog>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreePrivacy === 'Y'}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      setFormData(prev => ({ ...prev, agreePrivacy: isChecked ? 'Y' : 'N' }));
                      setHasError(prev => ({ ...prev, agreePrivacy: !isChecked }));
                    }}
                  />
                }
                label="[필수] 개인정보 수집 및 이용 동의"
              />
              <Button
                onClick={() => handleOpenDialog('privacy')}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                상세 보기
              </Button>

              {hasError.agreePrivacy && (
                <FormHelperText error>개인정보 수집 및 이용 동의는 필수입니다.</FormHelperText>
              )}

              <Dialog
                open={openDialog.privacy}
                onClose={() => handleCloseDialog('privacy')}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>개인정보 수집 및 이용 안내</DialogTitle>

                <DialogContent dividers sx={{ p: 0, height: { xs: '60vh', md: 480 } }}>
                  <Box
                    component="iframe"
                    src="/legal/privacy-terms.html"
                    title="개인정보 수집 및 이용 안내"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    style={{ border: 0, display: 'block' }}
                  />
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => handleCloseDialog('privacy')} variant="contained">
                    확인
                  </Button>

                  <Button
                    component="a"
                    href="/legal/privacy-terms.html"
                    target="_blank"
                    rel="noopener"
                    sx={{ textTransform: 'none' }}
                  >
                    새 창에서 보기
                  </Button>
                </DialogActions>
              </Dialog>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeMarketing === 'Y'}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      setFormData(prev => ({ ...prev, agreeMarketing: isChecked ? 'Y' : 'N' }));
                    }}
                  />
                }
                label="[선택] 마케팅 정보 수신 동의"
              />
              <Button
                onClick={() => handleOpenDialog('marketing')}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                상세 보기
              </Button>

              <Dialog
                open={openDialog.marketing}
                onClose={() => handleCloseDialog('marketing')}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>마케팅 정보 수신 동의 안내</DialogTitle>

                <DialogContent dividers sx={{ p: 0, height: { xs: '60vh', md: 480 } }}>
                  <Box
                    component="iframe"
                    src="/legal/marketing-terms.html"
                    title="마케팅 정보 수신 동의 안내"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    style={{ border: 0, display: 'block' }}
                  />
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => handleCloseDialog('marketing')} variant="contained">
                    확인
                  </Button>

                  <Button
                    component="a"
                    href="/legal/marketing-terms.html"
                    target="_blank"
                    rel="noopener"
                    sx={{ textTransform: 'none' }}
                  >
                    새 창에서 보기
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>

            {/* 버튼 */}
            <Box display="flex" gap={2} mt={3}>
              <Button type="submit" variant="contained" fullWidth>
                회원가입
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  router.push('/');
                }}
              >
                뒤로가기
              </Button>
            </Box>
          </Box>
        </Box>
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleClose}
          bottom="20px"
        />
      </Box>
    </main>
  );
}
