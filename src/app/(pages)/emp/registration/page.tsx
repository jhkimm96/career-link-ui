'use client';

import * as React from 'react';
import api from '@/api/axios';
import axios from 'axios';
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
  Stack,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PagesSectionLayout from '@/components/layouts/pagesSectionLayout';
import MainButtonArea from '@/components/mainBtn/mainButtonArea';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useS3Upload } from '@/hooks/useS3Upload';
import FileUpload from '@/components/fileUpload';

interface DuplicateCheckResponse {
  exists: boolean;
}

type BusinessStatusResponse = {
  data: {
    b_no: string;
    b_nm: string;
    b_stt: string;
    b_stt_cd: string;
    tax_type: string;
  }[];
};

export default function EmpPage() {
  const { previewUrl, selectedFile, setFile, getFormData } = useS3Upload({
    uploadType: 'BUSINESS_CERTIFICATE',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const [formData, setFormData] = React.useState<{
    companyName: string;
    bizRegNo: string;
    bizRegistrationUrl: string;
    companyEmail: string;
    ceoName: string;
    establishedDate: Dayjs | null;
    isApproved: string;
    agreeTerms: string;
    agreePrivacy: string;
    agreeMarketing: string;
  }>({
    companyName: '',
    bizRegNo: '',
    bizRegistrationUrl: '',
    companyEmail: '',
    ceoName: '',
    establishedDate: null,
    isApproved: 'N',
    agreeTerms: 'N',
    agreePrivacy: 'N',
    agreeMarketing: 'N',
  });

  const [helperText, setHelperText] = React.useState({
    companyName: '',
    bizRegNo: '',
    ceoName: '',
    establishedDate: '',
    bizRegistrationUrl: '',
    companyEmail: '',
    agreeTerms: '',
    agreePrivacy: '',
  });

  const [hasError, setHasError] = React.useState({
    companyName: false,
    bizRegNo: false,
    ceoName: false,
    establishedDate: false,
    bizRegistrationUrl: true,
    companyEmail: false,
    agreeTerms: true,
    agreePrivacy: true,
  });

  const [openDialog, setOpenDialog] = React.useState({
    terms: false,
    privacy: false,
    marketing: false,
    success: false,
  });
  const router = useRouter();

  const handleDateChange = (newValue: Dayjs | null) => {
    setHasError(prev => ({ ...prev, establishedDate: false }));
    setFormData(prev => ({ ...prev, establishedDate: newValue }));
  };

  // 동의 관련 팝업열기
  const handleOpenDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: true }));
  };

  // 동의 관련 팝업 닫기
  const handleCloseDialog = (key: string) => {
    setOpenDialog(prev => ({ ...prev, [key]: false }));
    if (key === 'success') {
      // Dialog 애니메이션 고려해서 약간 딜레이 줄 수 있음
      setTimeout(() => {
        router.push('/');
      }, 300); // 300ms 정도면 충분
    }
  };

  // snackBar 닫기
  const handleSnackBarClose = () => {
    closeSnackbar(setSnackbar);
  };

  // 실시간 입력 정합성 체크
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHasError(prev => ({ ...prev, [name]: false }));

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
      bizRegNo: !formData.bizRegNo,
      ceoName: !formData.ceoName,
      establishedDate: !formData.establishedDate,
      bizRegistrationUrl: !selectedFile,
      companyEmail: !formData.companyEmail,
      agreeTerms: hasError.agreeTerms,
      agreePrivacy: hasError.agreePrivacy,
    };
    setHasError(errors);

    const hasAnyError = Object.values(hasError).some(error => error);
    if (hasAnyError) {
      notifyError(setSnackbar, '입력한 내용을 확인해 주세요.');
      return;
    }

    try {
      const bizRegNo = formData.bizRegNo.trim();
      const bizRegNoRaw = formData.bizRegNo.replace(/-/g, '');

      // 사업자등록번호 진위 확인 api
      const verifyRes = await axios.post<BusinessStatusResponse>(
        'https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=' +
          process.env.NEXT_PUBLIC_API_DATA_KEY,
        {
          businesses: [
            {
              b_no: bizRegNoRaw,
              b_nm: formData.companyName,
              p_nm: formData.ceoName,
              start_dt: formData.establishedDate
                ? formData.establishedDate.format('YYYYMMDD')
                : null,
              p_nm2: '',
              corp_no: '',
              b_sector: '',
              b_type: '',
              b_adr: '',
            },
          ],
        }
      );

      const resValid = verifyRes.data.data?.[0]?.valid;

      if (resValid == '02') {
        notifyError(setSnackbar, '해당 정보로 등록된 사업자정보를 확인할 수 없습니다.');
        setHelperText(prev => ({
          ...prev,
          bizRegNo: '해당 정보로 등록된 사업자정보를 확인할 수 없습니다.',
        }));
        setHasError(prev => ({ ...prev, bizRegNo: true }));
        return;
      }
      // 사업자번호 중복확인
      const checkResponse = await api.get<DuplicateCheckResponse>(
        `/emp/check-bizRegNo?bizRegNo=${bizRegNo}`
      );

      if (checkResponse.data.exists) {
        notifyError(setSnackbar, '이미 등록된 사업자번호입니다');
        setHelperText(prev => ({
          ...prev,
          bizRegNo: '이미 등록된 사업자번호입니다.',
        }));
        setHasError(prev => ({ ...prev, bizRegNo: true }));
        return;
      }

      const requestFormData = getFormData();
      if (!requestFormData) {
        notifyError(setSnackbar, '사업자등록증 파일을 업로드해주세요.');
        return;
      }

      const jsonBlob = new Blob(
        [
          JSON.stringify({
            ...formData,
            establishedDate: formData.establishedDate?.format('YYYY-MM-DD') ?? '',
          }),
        ],
        { type: 'application/json' }
      );

      requestFormData.append('dto', jsonBlob);
      if (selectedFile) {
        requestFormData.append('file', selectedFile);
      }

      await api.post('/emp/registration-requests', requestFormData);

      setOpenDialog(prev => ({ ...prev, success: true }));
      notifySuccess(setSnackbar, '인증번호가 발송되었습니다.');
    } catch (err: any) {
      notifyError(setSnackbar, err.message);
    }
  };

  return (
    <main>
      <PagesSectionLayout title={'기업등록요청'}>
        <Box
          sx={{
            p: 5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            rowGap: 2,
          }}
        >
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
                required
                fullWidth
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
                required
                fullWidth
              />
            </FormGroup>

            <FormGroup>
              <TextField
                label="대표자명"
                name="ceoName"
                value={formData.ceoName}
                onChange={handleChange}
                error={hasError.ceoName}
                helperText={helperText.ceoName}
                required
                fullWidth
              />
            </FormGroup>

            <FormGroup>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                <DemoContainer components={['DatePicker']}>
                  <DatePicker
                    label="설립일"
                    name="establishedDate"
                    value={formData.establishedDate}
                    onChange={handleDateChange}
                    format="YYYY/MM/DD"
                    views={['year', 'month', 'day']}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        error: hasError.establishedDate,
                        helperText: helperText.establishedDate,
                      },
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </FormGroup>

            <FormGroup>
              <TextField
                label="이메일"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                error={hasError.companyEmail}
                helperText={helperText.companyEmail}
                required
                fullWidth
              />
            </FormGroup>

            <FormGroup>
              <Box>
                <FileUpload
                  previewUrl={previewUrl ?? undefined}
                  label={'사업자등록증'}
                  accept="image/*"
                  onFileChange={file => {
                    if (file) {
                      console.log('📂 파일 선택됨:', file.name);
                      setFile(file);
                      setHasError(prev => ({
                        ...prev,
                        bizRegistrationUrl: selectedFile,
                      }));
                    } else {
                      console.log('🗑 파일 삭제됨');
                      setFile(null as any);
                    }
                  }}
                  fileName={selectedFile?.name ?? ''}
                />
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
                  서비스 이용 약관 상세 내용이 여기에 들어갑니다. 예를 들어, 회원의 의무, 서비스
                  제공 조건 등... ...
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
                <Typography variant="body2">
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
                <Typography variant="body2">SMS, 문자메세지 수신동의</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleCloseDialog('marketing')} variant="contained">
                  확인
                </Button>
              </DialogActions>
            </Dialog>
            <br />
          </Box>
          <MainButtonArea saveAction={handleSubmit} saveLabel="기업등록요청" />
          <Dialog open={openDialog.success} onClose={() => handleCloseDialog('success')}>
            <DialogTitle>기업등록요청 완료</DialogTitle>
            <DialogContent dividers>
              <Typography>
                기업등록요청이 완료되었습니다.
                <br />
                관리자 검토단계를 거쳐 승인 시 입력하신 이메일로
                <br />
                기업정보등록 및 기업회원가입을 위한 메일이 발송됩니다.
                <br />
                승인처리는 <strong> 영업일 기준 3~5일</strong> 정도 소요됨을 안내드립니다.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleCloseDialog('success')} variant="contained">
                확인
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            backgroundColor: '#f9f9f9',
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
            기업 등록 요청 시 유의사항
          </Typography>

          <Stack spacing={1.5} mt={1}>
            <Stack direction="row" spacing={1}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
              <Typography variant="body2">
                다음 항목은 필수 입력입니다: <br />
                <strong>
                  기업명, 사업자등록번호, 대표자명, 설립일, 이메일, 사업자등록증, 약관 동의
                </strong>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
              <Typography variant="body2">
                사업자등록증에 기재된 정보와 <strong>정확히 일치해야</strong> 등록이 가능합니다.
                <br />
                입력하신 정보가 국세청과 불일치할 경우{' '}
                <strong>“등록된 사업자정보를 확인할 수 없습니다.”</strong>
                <br />
                메시지가 표시됩니다.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
              <Typography variant="body2">
                기업등록요청이 완료된 후 관리자 검토단계를 거쳐 승인 시 입력하신 이메일로
                <br />
                기업정보등록 및 기업회원가입을 위한 메일이 발송됩니다.
                <br />
                승인처리는 <strong> 영업일 기준 3~5일</strong> 정도 소요됨을 안내드립니다.
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </PagesSectionLayout>
      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackBarClose}
        bottom="70px"
      />
    </main>
  );
}
