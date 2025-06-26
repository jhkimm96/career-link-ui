// 개별 항목 DTO
export interface CoverLetterItemDto {
  itemId?: number; // 항목 ID
  title: string; // 항목 제목
  content: string; // 항목 내용
}

// 자소서 그룹 DTO
export interface CoverLetterDto {
  coverLetterId?: number; // 자소서 그룹 ID
  coverLetterTitle: string; // 자소서 제목
  userId?: string; // 사용자 ID (백엔드에서 세팅)
  isActive?: string; // 활성화 여부
  createdAt?: string; // 생성일시
  updatedAt?: string; // 수정일시
  items?: CoverLetterItemDto[]; // 자소서 항목 목록 (단건조회에서만 채워짐)
}
