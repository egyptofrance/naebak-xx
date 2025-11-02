import { getActiveJobs } from '@/data/jobs/queries';
import { getActiveJobCategories, getAllGovernorates } from '@/data/jobs/lookups';
import { 
  WORK_LOCATIONS, 
  EMPLOYMENT_TYPES,
  JobFilters,
  WorkLocation,
  EmploymentType,
} from '@/types/jobs';
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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12;

  // جلب التصنيفات والمحافظات من قاعدة البيانات
  const [categories, governorates] = await Promise.all([
    getActiveJobCategories(),
    getAllGovernorates(),
  ]);

  // استخراج الفلاتر من searchParams
  const filters: JobFilters = {
    category_id: params.category_id as string | undefined,
    work_location: params.work_location as WorkLocation | undefined,
    employment_type: params.employment_type as EmploymentType | undefined,
    governorate_id: params.governorate_id as string | undefined,
    search: params.search as string | undefined,
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
            categories={categories}
            workLocations={WORK_LOCATIONS}
            employmentTypes={EMPLOYMENT_TYPES}
            governorates={governorates}
          />
        </div>
      </div>
    </div>
  );
}
