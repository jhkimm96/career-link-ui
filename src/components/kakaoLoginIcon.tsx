'use client';

import { Button, styled } from '@mui/material';
import Image from 'next/image';

const KakaoButton = styled(Button)(({ theme }) => ({
  userSelect: 'none',
  backgroundColor: '#fee500',
  border: '1px solid #fee500',
  borderRadius: 4,
  padding: 0,
  width: 163,
  height: 40,
  minWidth: 'auto',
  overflow: 'hidden',
  transition: 'background-color 0.218s, box-shadow 0.218s',

  '&:hover': {
    boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
    backgroundColor: '#ffe812',
  },

  '&:disabled': {
    backgroundColor: '#fee50080',
    borderColor: '#fee50080',
    cursor: 'default',
  },
}));

export default function KakaoIconButton() {
  return (
    <KakaoButton disableRipple>
      <Image src="/kakao_login_medium_narrow.png" alt="카카오 로그인" width={163} height={40} />
    </KakaoButton>
  );
}
