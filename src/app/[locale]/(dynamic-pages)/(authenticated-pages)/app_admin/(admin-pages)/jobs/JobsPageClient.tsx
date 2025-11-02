'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import JobsTable from './JobsTable';
import JobsPagination from './JobsPagination';
import { JobWithStatistics } from '@/types/jobs';
import { useRouter } from 'next/navigation';

interface JobsPageClientProps {
  initialJobs: JobWithStatistics[];
  initialTotal: number;
  initialPage: number;
  itemsPerPage: number;
}

export default function JobsPageClient({
  initialJobs,
  initialTotal,
  initialPage,
  itemsPerPage,
}: JobsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(initialTotal / itemsPerPage);

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      router.push(`/app_admin/jobs?page=${page}`);
    });
  };

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
              <CardTitle className="text-3xl">{initialTotal}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الوظائف النشطة</CardDescription>
              <CardTitle className="text-3xl">
                {initialJobs.filter((j) => j.status === 'active').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الوظائف المسودة</CardDescription>
              <CardTitle className="text-3xl">
                {initialJobs.filter((j) => j.status === 'draft').length}
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
            <div className={isPending ? 'opacity-50 pointer-events-none' : ''}>
              <JobsTable jobs={initialJobs} />
            </div>
            
            {/* Pagination */}
            <JobsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={initialTotal}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
