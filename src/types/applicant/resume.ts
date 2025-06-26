// 조회용 DTO
export interface ResumeDto {
  resumeId: number;
  userId: string;
  title: string;
  isActive: string;
  createdAt?: string;
  updatedAt?: string;

  educations?: EducationDto[];
  experiences?: ExperienceDto[];
  certifications?: CertificationDto[];
  skills?: SkillDto[];
}

export interface EducationDto {
  educationId?: number;
  resumeId?: number;
  eduType?: string;
  schoolName?: string;
  examName?: string;
  examDate?: string;
  major?: string;
  creditEarned?: string;
  totalCredit?: string;
  startDate?: string;
  endDate?: string;
  graduateStatus?: string;
}

export interface ExperienceDto {
  experienceId?: number;
  resumeId?: number;
  companyName?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CertificationDto {
  certificationId?: number;
  resumeId?: number;
  name?: string;
  issuingOrganization?: string;
  acquiredDate?: string;
}

export interface SkillDto {
  skillId?: number;
  resumeId?: number;
  skillName?: string;
  proficiency?: string;
}

// 등록/수정용 DTO
export interface ResumeFormDto {
  title: string;
  isActive: string;
  educations: EducationDto[];
  experiences: ExperienceDto[];
  certifications: CertificationDto[];
  skills: SkillDto[];
}
