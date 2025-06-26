'use client';

import { useRouter } from 'next/navigation';
import ResumeForm from '@/components/form/applicant/resumeForm';
import { ResumeFormDto } from '@/types/applicant/resume';

export default function ResumeNewPage() {
  const router = useRouter();

  const initialData: ResumeFormDto = {
    title: '',
    isActive: 'Y',
    educations: [],
    experiences: [],
    certifications: [],
    skills: [],
  };

  return (
    <ResumeForm
      url="/applicant/resume/createResume" // POST 요청
      initialData={initialData}
      onSuccess={() => router.push('/mypage/applicant/resumes')} // 저장 후 목록으로
    />
  );
}
