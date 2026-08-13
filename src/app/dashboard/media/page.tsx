import PageContainer from '@/components/layout/page-container';
import MediaLibraryPage from '@/features/media/components/media-library-page';

export const metadata = {
  title: 'Dashboard: Media'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Media'
      pageDescription='Upload once, reuse across products. Duplicates are blocked by file hash.'
    >
      <MediaLibraryPage />
    </PageContainer>
  );
}
