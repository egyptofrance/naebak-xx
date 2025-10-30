import { notFound } from 'next/navigation';
import { getJobApplicationById } from '@/data/jobs/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, ExternalLink, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import ApplicationStatusUpdate from './ApplicationStatusUpdate';

export const metadata = {
  title: 'تفاصيل الطلب - لوحة التحكم',
  description: 'عرض تفاصيل طلب التوظيف',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const application = await getJobApplicationById(id);

  if (!application) {
    notFound();
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEducationLevel = (level: string | null) => {
    const levels: Record<string, string> = {
      'high-school': 'ثانوية عامة',
      'diploma': 'دبلوم',
      'bachelor': 'بكالوريوس',
      'master': 'ماجستير',
      'phd': 'دكتوراه',
      'other': 'أخرى',
    };
    return level ? levels[level] || level : 'غير محدد';
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/app_admin/job-applications">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى القائمة
            </Link>
          </Button>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{application.full_name}</CardTitle>
                {application.job && (
                  <CardDescription className="text-lg">
                    متقدم لوظيفة:{' '}
                    <Link
                      href={`/jobs/${application.job_id}`}
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      {application.job.title}
                      <ExternalLink className="inline h-4 w-4 mr-1" />
                    </Link>
                  </CardDescription>
                )}
              </div>
              <ApplicationStatusUpdate
                applicationId={application.id}
                currentStatus={application.status}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">معلومات التواصل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium" dir="ltr">{application.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{application.phone}</p>
                  </div>
                </div>
                {application.governorate && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">المحافظة</p>
                      <p className="font-medium">{application.governorate}</p>
                    </div>
                  </div>
                )}
                {application.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
                      <p className="font-medium">{formatDate(application.date_of_birth)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Education & Experience */}
            <div>
              <h3 className="font-semibold text-lg mb-4">المؤهلات والخبرة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.education_level && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">المستوى التعليمي</p>
                      <p className="font-medium">{getEducationLevel(application.education_level)}</p>
                    </div>
                  </div>
                )}
                {application.years_of_experience !== null && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">سنوات الخبرة</p>
                      <p className="font-medium">{application.years_of_experience} سنة</p>
                    </div>
                  </div>
                )}
              </div>

              {application.education_details && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">التفاصيل التعليمية</p>
                  <p className="text-sm">{application.education_details}</p>
                </div>
              )}

              {application.previous_experience && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">الخبرة السابقة</p>
                  <p className="text-sm whitespace-pre-wrap">{application.previous_experience}</p>
                </div>
              )}

              {application.skills && application.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">المهارات</p>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Information */}
            {(application.cover_letter || application.portfolio_url) && (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-4">معلومات إضافية</h3>
                  {application.cover_letter && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">خطاب التقديم</p>
                      <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                    </div>
                  )}
                  {application.portfolio_url && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">رابط الأعمال</p>
                      <a
                        href={application.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {application.portfolio_url}
                        <ExternalLink className="inline h-3 w-3 mr-1" />
                      </a>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Documents */}
            {application.cv_url && (
              <div>
                <h3 className="font-semibold text-lg mb-4">المستندات</h3>
                <Button variant="outline" asChild>
                  <a href={application.cv_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="ml-2 h-4 w-4" />
                    عرض السيرة الذاتية
                  </a>
                </Button>
              </div>
            )}

            {/* Admin Notes */}
            {application.admin_notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">ملاحظات الإدارة</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.admin_notes}
                  </p>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>تاريخ التقديم: {formatDate(application.created_at)}</p>
              {application.reviewed_at && (
                <p>تاريخ المراجعة: {formatDate(application.reviewed_at)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
