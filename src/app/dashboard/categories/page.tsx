import PageContainer from '@/components/layout/page-container';
import CategoryListingPage from '@/features/catalog/components/category-listing-page';
import { AddCategoryButton } from '@/features/catalog/components/category-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Categories'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Categories'
      pageDescription='Organize the Sukoon catalog into collections customers can browse.'
      pageHeaderAction={<AddCategoryButton />}
    >
      <CategoryListingPage />
    </PageContainer>
  );
}
