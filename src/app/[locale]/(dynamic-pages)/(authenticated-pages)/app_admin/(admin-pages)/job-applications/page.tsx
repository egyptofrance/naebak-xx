import { getJobApplications } from '@/data/jobs/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import ApplicationsTable from './ApplicationsTable';
import ApplicationFilters from './ApplicationFilters';

export const metadata = {
  title: 'إدارة طلبات التوظيف - لوحة التحكم',
  description: 'إدارة طلبات التوظيف المقدمة على منصة نائبك',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const filters = {
    status: params.status as any,
    job_id: params.job_id as string | undefined,
  };

  const { applications, total } = await getJobApplications(filters, 1, 100);

  const statusCounts = {
    total,
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة طلبات التوظيف</h1>
            <p className="text-muted-foreground mt-2">
              مراجعة وإدارة الطلبات المقدمة
            </p>
          </div>
          <Button size="lg">
            <Download className="ml-2 h-5 w-5" />
            تصدير CSV
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>الإجمالي</CardDescription>
              <CardTitle className="text-2xl">{statusCounts.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>قيد الانتظار</CardDescription>
              <CardTitle className="text-2xl">{statusCounts.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>قيد المراجعة</CardDescription>
              <CardTitle className="text-2xl">{statusCounts.reviewing}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>مرشح</CardDescription>
              <CardTitle className="text-2xl">{statusCounts.shortlisted}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>مقبول</CardDescription>
              <CardTitle className="text-2xl">{statusCounts.accepted}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>مرفوض</CardDescription>
              <CardTitle className="text-2xl">{statusCounts.rejected}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <ApplicationFilters />

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
            <CardDescription>
              جميع طلبات التوظيف المقدمة في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationsTable applications={applications} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
