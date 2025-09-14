export interface ApplicationDto {
  applicationId?: number;
  jobPostingId: number;
  resumeId: number;
  coverLetterId?: number | null; // 선택 가능
  status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'PASSED' | 'FAILED' | 'CANCELLED';
  appliedAt?: string;
  updatedAt?: string;
}
