'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PasswordChangeForm from '@/components/form/passwordChangeForm';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import type { ApplicantDto } from '@/types/applicant';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import { useConfirm } from '@/components/confirm';
import { useAuth } from '@/libs/authContext';
import { useRouter } from 'next/navigation';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function AccountPage() {
  const router = useRouter();
  const { setIsLoggedIn, setRemainingTime } = useAuth();
  const [mode, setMode] = useState<'profile' | 'password'>('profile');
  const [profile, setProfile] = useState<ApplicantDto | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  const confirm = useConfirm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<ApplicantDto>('/applicant/account/getProfile');
        setProfile(res.data);
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile?.phoneNumber) {
      notifyError(setSnackbar, '연락처를 입력해주세요.');
      return;
    }

    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
    if (!phoneRegex.test(profile.phoneNumber)) {
      notifyError(setSnackbar, '연락처는 000-0000-0000 형식으로 입력해주세요.');
      return;
    }
    const isConfirmed = await confirm({
      title: '변경사항을 저장하시겠습니까?',
      message: '저장하지 않으면 수정 내용이 사라집니다.',
      confirmText: '저장',
      cancelText: '취소',
    });
    if (isConfirmed) {
      try {
        await api.put('/applicant/account/updateProfile', {
          phoneNumber: profile?.phoneNumber,
          agreeMarketing: profile?.agreeMarketing,
          gender: profile?.gender,
        });
        notifySuccess(setSnackbar, '변경사항이 저장되었습니다.');
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    }
  };

  const handleWithdraw = async () => {
    const isConfirmed = await confirm({
      title: '회원탈퇴하시겠습니까?',
      message: '회원탈퇴 시 계정은 복구할 수 없습니다.',
      confirmText: '탈퇴',
      cancelText: '취소',
      destructive: true,
      intent: 'error',
    });

    if (isConfirmed) {
      try {
        await api.post('/applicant/account/withdraw');
        notifySuccess(setSnackbar, '회원탈퇴가 완료되었습니다.');
        await api.post('/api/users/logout');
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setRemainingTime(0);
        router.push('/main');
      } catch (err: any) {
        notifyError(setSnackbar, err.message);
      }
    }
  };

  // 연락처 전용 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // 숫자만

    if (value.length > 11) {
      value = value.slice(0, 11); // 최대 11자리
    }

    if (value.length <= 3) {
    } else if (value.length <= 7) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    }

    setProfile(prev => (prev ? { ...prev, phoneNumber: value } : prev));
  };

  if (!profile) return null;

  return (
    <PageSectionLayout title="계정관리">
      <Box>
        {mode === 'profile' ? (
          <>
            <Box
              sx={{
                p: 2,
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                프로필 정보
              </Typography>

              <Stack spacing={2}>
                <TextField label="이름" value={profile.loginId} size="small" fullWidth disabled />
                <TextField label="이름" value={profile.userName} size="small" fullWidth disabled />
                <TextField label="이메일" value={profile.email} size="small" fullWidth disabled />
                <TextField
                  label="연락처"
                  size="small"
                  fullWidth
                  value={profile.phoneNumber}
                  onChange={handlePhoneChange}
                />
                <Stack spacing={0.5} alignItems="flex-start">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={profile.agreeMarketing === 'Y'}
                        onChange={(_, checked) =>
                          setProfile(prev =>
                            prev ? { ...prev, agreeMarketing: checked ? 'Y' : 'N' } : prev
                          )
                        }
                      />
                    }
                    label="[선택] 마케팅 정보 수신 동의"
                  />

                  {profile.agreeMarketing === 'Y' && (
                    <Stack direction="row" spacing={1} sx={{ pl: 6 }}>
                      <InfoOutlinedIcon fontSize="small" color="info" />
                      <Typography variant="body2" color="text.secondary">
                        SMS, 문자메세지를 통해 다양한 소식을 받아보실 수 있습니다.
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>

              <Box mt={2} textAlign="right">
                <Button variant="contained" color="primary" onClick={handleSave}>
                  변경사항 저장
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                보안 설정
              </Typography>
              <Button variant="outlined" color="primary" onClick={() => setMode('password')}>
                비밀번호 변경
              </Button>
            </Box>

            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                계정을 더 이상 사용하지 않으시나요?
              </Typography>
              <Button variant="outlined" color="error" onClick={handleWithdraw}>
                회원탈퇴
              </Button>
            </Box>
          </>
        ) : (
          <PasswordChangeForm
            url="/applicant/account/changePassword"
            onCancel={() => setMode('profile')}
          />
        )}
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => closeSnackbar(setSnackbar)}
          bottom="10px"
        />
      </Box>
    </PageSectionLayout>
  );
}
