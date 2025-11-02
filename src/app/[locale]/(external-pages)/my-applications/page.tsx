import { redirect } from 'next/navigation';
import { getUserProfile } from '@/data/user/queries';
import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Briefcase, MapPin } from 'lucide-react';

export default async function MyApplicationsPage() {
  const user = await getUserProfile();

  if (!user) {
    redirect('/sign-in');
  }

  const supabase = createSupabaseUserServerComponentClient();

  const { data: applications, error } = await supabase
    .from('job_applications')
    .select(`
      id,
      status,
      created_at,
      company_notes,
      jobs (
        id,
        title,
        company_name,
        governorate,
        employment_type,
        salary_min,
        salary_max,
        salary_currency
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">طلباتي</h1>
          <p className="text-muted-foreground">
            تابع حالة طلباتك المقدمة على الوظائف
          </p>
        </div>

        {!applications || applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">لم تقدم على أي وظيفة بعد</p>
              <Button asChild>
                <Link href="/jobs">تصفح الوظائف المتاحة</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application: any) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {application.jobs?.title || 'وظيفة محذوفة'}
                      </CardTitle>
                      {application.jobs?.company_name && (
                        <p className="text-muted-foreground">
                          {application.jobs.company_name}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {application.jobs?.governorate && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{application.jobs.governorate}</span>
                      </div>
                    )}
                    {application.jobs?.employment_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{application.jobs.employment_type}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(application.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>

                  {application.company_notes && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">ملاحظات الشركة:</p>
                      <p className="text-sm">{application.company_notes}</p>
                    </div>
                  )}

                  {application.jobs?.id && (
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/jobs/${application.jobs.id}`}>
                          عرض تفاصيل الوظيفة
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
