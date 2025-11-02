import { getAllJobs } from '@/data/jobs/queries';
import JobsPageClient from './JobsPageClient';

export const metadata = {
  title: 'إدارة الوظائف - لوحة التحكم',
  description: 'إدارة الوظائف المتاحة في منصة نائبك',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminJobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const itemsPerPage = 20;

  const { jobs, total } = await getAllJobs({}, page, itemsPerPage);

  return (
    <JobsPageClient
      initialJobs={jobs}
      initialTotal={total}
      initialPage={page}
      itemsPerPage={itemsPerPage}
    />
  );
}
