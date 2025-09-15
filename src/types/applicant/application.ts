export interface ApplicationDto {
  applicationId?: number;
  jobPostingId?: number;
  jobTitle?: string;
  applicantName?: string;
  email?: string;
  resumeId?: number; // 추가
  coverLetterId?: number | null; // 추가
  resumeTitle?: string;
  status?: string;
  appliedAt?: string;
  updatedAt?: string;
}
