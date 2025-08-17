import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SendIcon from '@mui/icons-material/Send';

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
    // { label: '이력서/자소서', path: '/mypage/resume', icon: EditIcon },
    // { label: '스크랩/관심기업', path: '/mypage/scrap', icon: StarBorderIcon },
    // {
    //   label: '지원할 만한 공고',
    //   icon: ThumbUpAltIcon,
    //   children: [
    //     { label: '추천 공고', path: '/mypage/recommend' },
    //     { label: '맞춤 공고', path: '/mypage/custom' },
    //   ],
    // },
    {
      label: '메뉴관리',
      icon: MailOutlineIcon,
      path: '/mypage/admin/menu',
    },
    {
      label: '공통코드관리',
      icon: MailOutlineIcon,
      path: '/mypage/admin/commonCode',
    },
    // {
    //   label: '지원내역',
    //   icon: SendIcon,
    //   children: [
    //     { label: '지원 리스트', path: '/mypage/applied' },
    //     { label: '제외 기업', path: '/mypage/excluded' },
    //   ],
    // },
  ],
  company: [],
  admin: [],
};
