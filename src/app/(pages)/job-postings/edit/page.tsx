'use client';
import { useSearchParams } from 'next/navigation';
import JobPostingUpsertForm from '@/components/form/JobPostingUpsertForm';

export default function EditJobPostingPage() {
  const sp = useSearchParams();
  const id = sp.get('id');
  if (!id) return null;
  return <JobPostingUpsertForm jobPostingId={id} />;
}
