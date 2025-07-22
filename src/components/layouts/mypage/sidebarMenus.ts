import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SendIcon from '@mui/icons-material/Send';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import MicIcon from '@mui/icons-material/Mic';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

export type UserType = 'applicant' | 'company' | 'admin';

export interface SidebarMenuItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: {
    label: string;
    path: string;
  }[];
}

export const menus: Record<UserType, SidebarMenuItem[]> = {
  applicant: [
    { label: 'MY홈', path: '/mypage', icon: HomeIcon },
    { label: '이력서/자소서', path: '/mypage/resume', icon: EditIcon },
    { label: '스크랩/관심기업', path: '/mypage/scrap', icon: StarBorderIcon },
    {
      label: '지원할 만한 공고',
      icon: ThumbUpAltIcon,
      children: [
        { label: '추천 공고', path: '/mypage/recommend' },
        { label: '맞춤 공고', path: '/mypage/custom' },
      ],
    },
    {
      label: '받은 제안',
      icon: MailOutlineIcon,
      children: [
        { label: '전체 제안', path: '/mypage/offer' },
        { label: '열람 제안', path: '/mypage/read' },
      ],
    },
    {
      label: '지원내역',
      icon: SendIcon,
      children: [
        { label: '지원 리스트', path: '/mypage/applied' },
        { label: '제외 기업', path: '/mypage/excluded' },
      ],
    },
    { label: '진단/검사', path: '/mypage/test', icon: ScienceIcon },
    { label: '공기업 모의고사', path: '/mypage/mocktest', icon: SchoolIcon },
    { label: '면접관리', path: '/mypage/interview', icon: MicIcon },
    { label: '결제 내역', path: '/mypage/payment', icon: ReceiptLongIcon },
    { label: '내 쿠폰', path: '/mypage/coupon', icon: ConfirmationNumberIcon },
    { label: '커리어 마일리지', path: '/mypage/mileage', icon: ShoppingBagIcon },
  ],
  company: [],
  admin: [],
};
