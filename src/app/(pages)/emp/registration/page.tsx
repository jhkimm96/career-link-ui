'use client';

import * as React from 'react';
import 'dayjs/locale/ko';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Typography,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';

interface DuplicateCheckResponse {
  exists: boolean;
}

export default function EmpPage() {
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [redirectOnClose, setRedirectOnClose] = React.useState(false);

  const [formData, setFormData] = React.useState<{
    companyName: string;
    bizRegNo: string;
    bizRegistrationUrl: string;
    companyEmail: string;
    isApproved: string;
    agreeTerms: string;
    agreePrivacy: string;
    agreeMarketing: string;
  }>({
    companyName: '',
    bizRegNo: '',
    bizRegistrationUrl: 'test',
    companyEmail: '',
    isApproved: 'N',
    agreeTerms: 'N',
    agreePrivacy: 'N',
    agreeMarketing: 'N',
  });

  const [helperText, setHelperText] = React.useState({
    companyName: '',
    bizRegNo: '',
    bizRegistrationUrl: '',
    companyEmail: '',
    agreeTerms: '',
    agreePrivacy: '',
  });

  const [hasError, setHasError] = React.useState({
    companyName: false,
    bizRegNo: false,
    bizRegistrationUrl: true,
    companyEmail: false,
    agreeTerms: true,
    agreePrivacy: true,
  });

  const [openDialog, setOpenDialog] = React.useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const router = useRouter();

  // 동의 관련 팝업열기
  const handleOpenDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: true }));
  };

  // 동의 관련 팝업 닫기
  const handleCloseDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: false }));
  };

  // alert창 닫기 후 main 페이지로 이동
  const handleClose = () => {
    setShowAlert(false);
    if (redirectOnClose) {
      router.push('/main'); // ✅ 닫을 때만 이동
    }
  };

  // 실시간 입력 정합성 체크
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'bizRegNo') {
      const onlyNums = value.replace(/[^0-9]/g, '');

      let formatted = '';
      if (onlyNums.length <= 3) {
        formatted = onlyNums;
      } else if (onlyNums.length <= 5) {
        formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else {
        formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 5)}-${onlyNums.slice(5, 10)}`;
      }

      const isValid = onlyNums.length === 10;

      setFormData(prev => ({ ...prev, [name]: formatted }));

      if (!isValid && onlyNums.length > 10) {
        setHelperText(prev => ({
          ...prev,
          bizRegNo: '올바른 사업자등록번호가 아닙니다. (10자리 숫자)',
        }));
        setHasError(prev => ({ ...prev, bizRegNo: true }));
      } else {
        setHelperText(prev => ({ ...prev, bizRegNo: '' }));
        setHasError(prev => ({ ...prev, bizRegNo: false }));
      }
    } else if (name === 'companyEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      setFormData(prev => ({ ...prev, [name]: value }));

      if (!emailRegex.test(value)) {
        setHelperText(prev => ({
          ...prev,
          companyEmail: '올바른 이메일 형식이 아닙니다.',
        }));
        setHasError(prev => ({ ...prev, companyEmail: true }));
      } else {
        setHelperText(prev => ({ ...prev, companyEmail: '' }));
        setHasError(prev => ({ ...prev, companyEmail: false }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 기업등록요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      companyName: !formData.companyName.trim(),
      bizRegNo: hasError.bizRegNo,
      bizRegistrationUrl: !formData.bizRegistrationUrl,
      companyEmail: !formData.companyEmail,
      agreeTerms: hasError.agreeTerms,
      agreePrivacy: hasError.agreePrivacy,
    };

    setHasError(errors);

    const hasAnyError = Object.values(hasError).some(error => error);
    if (hasAnyError) {
      setAlertMessage('입력한 내용을 확인해 주세요.');
      setShowAlert(true);
      return;
    }

    try {
      const bizRegNo = formData.bizRegNo.trim();
      const checkResponse = await api.get<DuplicateCheckResponse>(
        `/api/emp/check-bizRegNo?bizRegNo=${bizRegNo}`
      );

      if (checkResponse.data.exists) {
        setAlertMessage('입력한 내용을 확인해 주세요.');
        setShowAlert(true);
        setHelperText(prev => ({
          ...prev,
          bizRegNo: '이미 등록된 사업자번호입니다.',
        }));
        setHasError(prev => ({ ...prev, bizRegNo: true }));
        return;
      }

      const response = await api.post(
        '/api/emp/registration-requests',
        {
          companyName: formData.companyName,
          bizRegNo: formData.bizRegNo,
          bizRegistrationUrl: formData.bizRegistrationUrl,
          companyEmail: formData.companyEmail,
          isApproved: formData.isApproved,
          agreeTerms: formData.agreeTerms,
          agreePrivacy: formData.agreePrivacy,
          agreeMarketing: formData.agreeMarketing,
        },
        {
          withCredentials: false,
        }
      );

      setAlertMessage('기업등록요청이 완료되었습니다.');
      setShowAlert(true);
      setRedirectOnClose(true);
    } catch (error: any) {
      setAlertMessage('기업등록요청 중 오류가 발생했습니다.');
      setShowAlert(true);
      setRedirectOnClose(false);
    }
  };

  return (
    <main>
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={handleClose} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <Box display="flex" justifyContent="center">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ '& > :not(style)': { m: 1 } }}
          noValidate
          autoComplete="off"
        >
          <FormGroup>
            <TextField
              label="기업명"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={hasError.companyName}
              helperText={helperText.companyName}
              fullWidth
              sx={{ maxWidth: '400px' }}
            />
          </FormGroup>

          <FormGroup>
            <TextField
              label="사업자등록번호"
              name="bizRegNo"
              value={formData.bizRegNo}
              onChange={handleChange}
              error={hasError.bizRegNo}
              helperText={helperText.bizRegNo}
              fullWidth
              sx={{ maxWidth: '400px' }}
            />
          </FormGroup>

          <FormGroup>
            <TextField
              label="이메일"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleChange}
              error={hasError.companyEmail}
              helperText={helperText.companyEmail}
              fullWidth
              sx={{ maxWidth: '400px' }}
            />
          </FormGroup>

          <FormGroup>
            <Box>
              <Button variant="outlined" component="label" fullWidth sx={{ maxWidth: '400px' }}>
                사업자등록증 업로드
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({
                        ...prev,
                        bizRegistrationUrl: file.name,
                      }));
                      setHasError(prev => ({ ...prev, bizRegistrationUrl: false }));
                      setHelperText(prev => ({
                        ...prev,
                        bizRegistrationUrl: '',
                      }));

                      // TODO: 실제 업로드 처리 로직 필요 (ex. AWS S3 업로드 후 URL 저장)
                    } else {
                      setHasError(prev => ({ ...prev, bizRegistrationUrl: true }));
                      setHelperText(prev => ({
                        ...prev,
                        bizRegistrationUrl: '파일을 업로드해주세요.',
                      }));
                    }
                  }}
                />
              </Button>
              {formData.bizRegistrationUrl && (
                <Typography variant="body2" mt={1}>
                  업로드된 파일: {formData.bizRegistrationUrl}
                </Typography>
              )}
              {hasError.bizRegistrationUrl && (
                <FormHelperText error>{helperText.bizRegistrationUrl}</FormHelperText>
              )}
            </Box>
          </FormGroup>
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
          <Button variant="contained" fullWidth sx={{ maxWidth: '400px' }} type="submit">
            기업등록요청
          </Button>
        </Box>
      </Box>
    </main>
  );
}
