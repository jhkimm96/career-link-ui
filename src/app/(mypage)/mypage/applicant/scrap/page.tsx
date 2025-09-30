import ScrapCardList from '@/components/form/ScrapCardList';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';

export default function ApplicantScrapPage() {
  return (
    <PageSectionLayout title="스크랩관리">
      <div>
        <ScrapCardList />
      </div>
    </PageSectionLayout>
  );
}
