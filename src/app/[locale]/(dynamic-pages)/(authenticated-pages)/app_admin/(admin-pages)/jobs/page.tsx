import { getAllJobs } from '@/data/jobs/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import JobsTable from './JobsTable';

export const metadata = {
  title: 'إدارة الوظائف - لوحة التحكم',
  description: 'إدارة الوظائف المتاحة في منصة نائبك',
};

export default async function AdminJobsPage() {
  const { jobs, total } = await getAllJobs({}, 1, 100);

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة الوظائف</h1>
            <p className="text-muted-foreground mt-2">
              إضافة وتعديل وحذف الوظائف المتاحة
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/app_admin/jobs/new">
              <Plus className="ml-2 h-5 w-5" />
              إضافة وظيفة جديدة
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>إجمالي الوظائف</CardDescription>
              <CardTitle className="text-3xl">{total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الوظائف النشطة</CardDescription>
              <CardTitle className="text-3xl">
                {jobs.filter((j) => j.status === 'active').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الوظائف المسودة</CardDescription>
              <CardTitle className="text-3xl">
                {jobs.filter((j) => j.status === 'draft').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الوظائف</CardTitle>
            <CardDescription>
              جميع الوظائف المتاحة في المنصة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobsTable jobs={jobs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
