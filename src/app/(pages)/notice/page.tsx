'use client';

interface NoticeDto {
  noticeId: number;
  noticeType: string;
  title: string;
  writerId: string;
  viewCount: number;
  isTopFixed: string;
  isExposed: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}
export default function NoticePage() {
  return <div></div>;
}
