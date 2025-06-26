export interface ApplicantDto {
  userId: string;
  loginId: string;
  userName: string;
  phoneNumber: string;
  birthDate: string; // ISO string
  gender: string;
  userType?: string;
  email: string;

  lastLoginAt?: string | null;
  dormantAt?: string | null;

  agreeTerms: string;
  agreePrivacy: string;
  agreeMarketing: string;
  userStatus: string;

  createdAt: string;
  updatedAt: string;
}
