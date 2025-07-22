'use client';

import * as React from 'react';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Input,
  InputLabel,
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
  Snackbar,
  Alert,
} from '@mui/material';

interface CheckIdResponse {
  exists: boolean;
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    loginId: string;
    password: string;
    confirmPassword: string;
    socialType: string;
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
  });
  const [hasError, setHasError] = React.useState({
    loginId: false,
    confirmPassword: false,
    agreeTerms: true,
    agreePrivacy: true,
    phoneNumber: false,
  });

  const [isIdChecked, setIsIdChecked] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const router = useRouter();

  const handleOpenDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: true }));
  };

  const handleCloseDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: false }));
  };

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleClickShowConfirmPassword = () => setShowConfirmPassword(show => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

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
          loginId: '아이디는 영문 소문자 및 숫자만 5~20자로 입력해주세요.',
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

  const handleDateChange = (newValue: Dayjs | null) => {
    setFormData(prev => ({ ...prev, birthDate: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isIdChecked) {
      setAlertMessage('아이디 중복체크 후 진행해 주세요.');
      setShowAlert(true);
      return;
    }

    const hasAnyError = Object.values(hasError).some(error => error);
    if (hasAnyError) {
      setAlertMessage('입력한 내용을 확인해 주세요.');
      setShowAlert(true);
      return;
    }

    try {
      const response = await api.post(
        '/api/users/signup',
        {
          loginId: formData.loginId,
          password: formData.password,
          socialType: formData.socialType,
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

      console.log('✅ 회원가입 성공: ' + response.data);
      router.push('/login');
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      setAlertMessage('회원가입 실패');
      setShowAlert(true);
    }
  };

  return (
    <main>
      <Box display="flex" justifyContent="center">
        <Snackbar
          open={showAlert}
          autoHideDuration={3000}
          onClose={() => setShowAlert(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="warning" onClose={() => setShowAlert(false)} sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ '& > :not(style)': { m: 1 } }}
          noValidate
          autoComplete="off"
        >
          <FormControl error={hasError.loginId} variant="standard">
            <InputLabel htmlFor="component-error">아이디</InputLabel>
            <Input
              id="component-error"
              name="loginId"
              aria-describedby="component-error-text"
              value={formData.loginId}
              onChange={handleChange}
            />
            <FormHelperText id="component-error-text">{helperText.loginId}</FormHelperText>
          </FormControl>
          <Button variant="outlined" onClick={handleCheckDuplicate}>
            중복확인
          </Button>
          <br />
          <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
            <InputLabel htmlFor="standard-adornment-password">비밀번호</InputLabel>
            <Input
              id="standard-adornment-password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'hide the password' : 'display the password'}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl
            error={hasError.confirmPassword}
            sx={{ m: 1, width: '25ch' }}
            variant="standard"
          >
            <InputLabel htmlFor="standard-adornment-password">비밀번호 확인</InputLabel>
            <Input
              id="standard-adornment-password"
              name="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              type={showConfirmPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirmPassword ? 'hide the password' : 'display the password'}
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText id="component-error-text">{helperText.confirmPassword}</FormHelperText>
          </FormControl>
          <br />
          <TextField
            error={hasError.phoneNumber}
            id="standard-search"
            label="휴대폰 번호"
            name="phoneNumber"
            type="search"
            variant="standard"
            value={formData.phoneNumber}
            onChange={handleChange}
            helperText={hasError.phoneNumber ? helperText.phoneNumber : ''}
          />
          <br />
          <TextField
            id="standard-search"
            label="이메일"
            name="email"
            type="search"
            variant="standard"
            value={formData.email}
            onChange={handleChange}
          />
          <br />
          <TextField
            id="standard-search"
            label="이름"
            name="userName"
            type="search"
            variant="standard"
            value={formData.userName}
            onChange={handleChange}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                value={formData.birthDate}
                name="birthDate"
                label={'생년월일 -- 본인인증시 입력필요없음'}
                views={['year', 'month', 'day']}
                onChange={handleDateChange}
              />
            </DemoContainer>
          </LocalizationProvider>
          <br />
          <FormGroup>
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeTerms === 'Y'}
                    onChange={e => {
                      const isChecked = e.target.checked;

                      setFormData(prev => ({
                        ...prev,
                        agreeTerms: isChecked ? 'Y' : 'N',
                      }));

                      setHasError(prev => ({
                        ...prev,
                        agreeTerms: !isChecked,
                      }));
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
          </FormGroup>

          <Dialog
            open={openDialog.terms}
            onClose={() => handleCloseDialog('terms')}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>서비스 이용약관 동의 안내</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph>
                서비스 이용 약관 상세 내용이 여기에 들어갑니다. 예를 들어, 회원의 의무, 서비스 제공
                조건 등... ...
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleCloseDialog('terms')} variant="contained">
                확인
              </Button>
            </DialogActions>
          </Dialog>

          <FormGroup>
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreePrivacy === 'Y'}
                    onChange={e => {
                      const isChecked = e.target.checked;

                      setFormData(prev => ({
                        ...prev,
                        agreePrivacy: isChecked ? 'Y' : 'N',
                      }));

                      setHasError(prev => ({
                        ...prev,
                        agreePrivacy: !isChecked,
                      }));
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
            </Box>
            {hasError.agreePrivacy && (
              <FormHelperText error>개인정보 이용 동의는 필수입니다.</FormHelperText>
            )}
          </FormGroup>

          <Dialog
            open={openDialog.privacy}
            onClose={() => handleCloseDialog('privacy')}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>개인정보 수집 및 이용 안내</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph>
                1. 수집 항목: 이름, 연락처, 이메일 등<br />
                2. 수집 목적: 회원 가입, 서비스 제공, 고객 응대
                <br />
                3. 보유 기간: 회원 탈퇴 시까지 또는 법령에 따른 보관기간
                <br />
                4. 개인정보 제공 거부 시 서비스 이용에 제한이 있을 수 있습니다.
                <br />
                ...
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleCloseDialog('privacy')} variant="contained">
                확인
              </Button>
            </DialogActions>
          </Dialog>

          <FormGroup>
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeMarketing === 'Y'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        agreeMarketing: e.target.checked ? 'Y' : 'N',
                      })
                    }
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
            </Box>
          </FormGroup>

          <Dialog
            open={openDialog.marketing}
            onClose={() => handleCloseDialog('marketing')}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>[선택] 마케팅 정보 수신 동의 안내</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph>
                SMS, 문자메세지 수신동의
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleCloseDialog('marketing')} variant="contained">
                확인
              </Button>
            </DialogActions>
          </Dialog>

          <br />
          <Button variant="contained" type="submit">
            회원가입
          </Button>
          <Button variant="outlined">뒤로가기</Button>
        </Box>
      </Box>
    </main>
  );
}
