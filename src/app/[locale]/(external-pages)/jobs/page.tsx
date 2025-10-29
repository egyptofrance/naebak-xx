import { getActiveJobs } from '@/data/jobs/queries';
import { JOB_CATEGORIES, WORK_LOCATIONS, EMPLOYMENT_TYPES, GOVERNORATES } from '@/types/jobs';
import JobsGrid from './JobsGrid';

// Force dynamic rendering - no caching
export const revalidate = 0;

export const metadata = {
  title: 'الوظائف المتاحة - نائبك',
  description: 'تصفح الوظائف المتاحة في منصة نائبك وقدم طلبك الآن',
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;

  // استخراج الفلاتر من searchParams
  const filters = {
    category: searchParams.category as string | undefined,
    work_location: searchParams.work_location as string | undefined,
    employment_type: searchParams.employment_type as string | undefined,
    governorate: searchParams.governorate as string | undefined,
    search: searchParams.search as string | undefined,
  };

  const { jobs, total } = await getActiveJobs(filters, page, limit);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              الوظائف المتاحة
            </h1>
            <p className="text-lg text-muted-foreground">
              انضم إلى فريق نائبك وكن جزءاً من التغيير
            </p>
          </div>

          {/* Jobs Grid with Filters */}
          <JobsGrid
            initialJobs={jobs}
            total={total}
            currentPage={page}
            limit={limit}
            categories={JOB_CATEGORIES}
            workLocations={WORK_LOCATIONS}
            employmentTypes={EMPLOYMENT_TYPES}
            governorates={GOVERNORATES}
          />
        </div>
      </div>
    </div>
  );
}
