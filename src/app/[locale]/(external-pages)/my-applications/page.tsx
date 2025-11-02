import Link from 'next/link';
import { getUserJobApplications } from '@/data/employment/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

export const metadata = {
  title: 'طلباتي',
  description: 'متابعة طلبات التوظيف الخاصة بك',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'قيد الانتظار',
  reviewing: 'قيد المراجعة',
  shortlisted: 'القائمة المختصرة',
  accepted: 'مقبول',
  rejected: 'مرفوض',
};

export default async function MyApplicationsPage() {
  const applications = await getUserJobApplications();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">طلبات التوظيف</h1>
        <p className="text-muted-foreground">
          متابعة حالة طلباتك للوظائف المختلفة
        </p>
      </div>
      
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات بعد</h3>
            <p className="text-muted-foreground mb-4">
              لم تتقدم لأي وظيفة حتى الآن
            </p>
            <Button asChild>
              <Link href="/jobs">تصفح الوظائف المتاحة</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {app.job?.title || 'وظيفة محذوفة'}
                    </CardTitle>
                    {app.job?.company_name && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {app.job.company_name}
                      </p>
                    )}
                  </div>
                  <Badge className={statusColors[app.status]}>
                    {statusLabels[app.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>تقدمت في: {new Date(app.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {app.job?.work_location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{app.job.work_location}</span>
                    </div>
                  )}
                </div>
                
                {app.reviewed_at && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      تمت المراجعة في: {new Date(app.reviewed_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                  {app.job && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/jobs/${app.job.id}`}>
                        عرض الوظيفة
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
